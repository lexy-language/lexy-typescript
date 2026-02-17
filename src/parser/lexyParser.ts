import type {IParserContext} from "./context/parserContext";
import type {ITokenizer} from "./tokens/tokenizer";
import type {IParsableNode} from "../language/parsableNode";
import type {IExpressionFactory} from "../language/expressions/expressionFactory";
import type {IFileSystem} from "../infrastructure/IFileSystem";
import type {ILogger} from "../infrastructure/logger";

import {ParserResult} from "./parserResult";
import {ParsableNodeIndex} from "../language/parsableNodeIndex";
import {ParseLineContext} from "./context/parseLineContext";
import {Include} from "../language/include";
import {ValidationContext} from "./context/validationContext";
import {DependencyGraphFactory} from "../dependencyGraph/dependencyGraphFactory";
import {ParserContext} from "./context/parserContext";
import {ParseOptions} from "./parseOptions";
import {Dependencies} from "../dependencyGraph/dependencies";
import {TrackLoggingCurrentNodeVisitor} from "./TrackLoggingCurrentNodeVisitor";
import {Line} from "./line";
import {ILibraries} from "../functionLibraries/libraries";
import {Assert} from "../infrastructure/assert";
import {asComponentNode} from "../language/componentNode";
import {StringSourceCodeDocument} from "./documents/stringSourceCodeDocument";
import {ISourceCodeDocument} from "./documents/ISourceCodeDocument";
import {DocumentSymbols, IDocumentSymbols} from "./symbols/documentSymbols";

export interface ILexyParser {
  parseCode(fileName: string, content: string[], options: ParseOptions | null): Promise<ParserResult>;
  parseFile(fileName: string, options: ParseOptions | null): Promise<ParserResult>;
  parseFiles(fileNames: readonly string[], options: ParseOptions | null): Promise<ParserResult>;
  parseDocuments(sourceCodeDocuments: readonly ISourceCodeDocument[], options: ParseOptions | null): Promise<ParserResult>;
}

export class LexyParser implements ILexyParser {

  private readonly tokenizer: ITokenizer;
  private readonly baseLogger: ILogger;
  private readonly fileSystem: IFileSystem;
  private readonly libraries: ILibraries;
  private readonly expressionFactory: IExpressionFactory;

  constructor(baseLogger: ILogger, tokenizer: ITokenizer,
              fileSystem: IFileSystem, expressionFactory: IExpressionFactory,
              libraries: ILibraries) {
    this.baseLogger = baseLogger;
    this.tokenizer = tokenizer;
    this.fileSystem = fileSystem;
    this.expressionFactory = expressionFactory;
    this.libraries = Assert.notNull(libraries, "libraries");
  }

  public async parseCode(fileName: string, content: string[], options: ParseOptions | null): Promise<ParserResult> {

    Assert.notNull(fileName, "fileName");
    Assert.notNull(content, "content");

    this.baseLogger.logInformation(`Parse code: ${fileName}`);

    const document = new StringSourceCodeDocument(content, fileName);
    return await this.parseDocuments([document], options);
  }

  public async parseFile(fileName: string, options: ParseOptions | null): Promise<ParserResult> {

    this.baseLogger.logInformation(`Parse file: ${fileName}`);

    const fullPath = this.fileSystem.getFullPath(fileName);
    const document = await this.fileSystem.createFileSourceDocument(fullPath);
    try {
      return await this.parseDocuments([document], options);
    } catch (error) {
      document.dispose();
      throw error;
    }
  }

  public async parseFiles(fileNames: readonly string[], options: ParseOptions | null): Promise<ParserResult> {

    this.baseLogger.logInformation(`Parse files: ${fileNames.join(", ")}`);

    const documents = await this.fileSystem.createFileSourceDocuments(fileNames)
    try {
      return await this.parseDocuments(documents.documents, options);
    } catch (error) {
      documents.dispose();
      throw error;
    }
  }

  public async parseDocuments(sourceCodeDocuments: ISourceCodeDocument[], options: ParseOptions | null): Promise<ParserResult> {

    Assert.notNull(sourceCodeDocuments, "sourceCodeDocuments");

    const context = new ParserContext(this.baseLogger, this.fileSystem, this.expressionFactory, this.libraries, options);

    for (const sourceCodeDocument of sourceCodeDocuments) {
      context.addFileIncluded(sourceCodeDocument.fullFileName);
      context.setFileLineFilter(sourceCodeDocument.fullFileName);

      await this.parseDocument(sourceCodeDocument, context);
    }

    context.logger.logNodes(context.nodes.values);

    const dependencies = this.sortByDependencyAndCheckCircularDependencies(context);
    if (!dependencies.hasCircularReferences) {
      context.rootNode.sortByDependency(dependencies.sortedNodes);
      LexyParser.validateNodesTree(context);
    }

    if (context.options?.suppressException != true) {
      context.logger.assertNoErrors();
    }

    return new ParserResult(context.rootNode, context.nodes, context.logger, dependencies, context.symbols);
  }

  private async parseDocument(sourceCodeDocument: ISourceCodeDocument, context: IParserContext): Promise<void> {

    let currentIndent = 0;
    let nodesPerIndent = new ParsableNodeIndex(context.rootNode);
    const symbols = context.symbols.document(sourceCodeDocument.fullFileName);

    while (sourceCodeDocument.hasMoreLines()) {

      const line = sourceCodeDocument.nextLine();
      symbols.add(line);

      if (!this.tokenizeLine(line, context)) {
        currentIndent = line?.indent(context.logger) ?? currentIndent;
        continue;
      }

      const indentResult = this.getIndent(context, line);
      if (!indentResult.success) continue;
      const indent = indentResult.value;

      if (indent > currentIndent) {
        context.logger.fail(line.tokens.allReference(), `Invalid indent: ${indent}`);
        continue;
      }

      let node = nodesPerIndent.getCurrentOrDescend(indent);
      node = this.parseLine(line, context, node, symbols, nodesPerIndent, indent);

      currentIndent = indent + 1;

      nodesPerIndent.set(currentIndent, node);
    }

    this.reset(context);

    await this.loadIncludedFiles(context, sourceCodeDocument.fullFileName);
  }

  private getIndent(context: IParserContext, line: Line): {success: boolean, value: number} {

    if (line.isEmpty()) return {success: false, value: 0};

    let indent = line.indent(context.logger);
    return indent == null
      ? {success: false, value: 0}
      : {success: true, value: indent as number};
  }

  private tokenizeLine(line: Line, context: IParserContext): boolean {

    const reference = line.lineReference(0);
    if (!context.lineFilter.useLine(line.content)) {
      context.logger.log(reference, `Skip line by filter: '${line.content}'`);
      return false;
    }

    context.logger.log(reference, `'${line.content}'`);

    const tokens = line.tokenize(this.tokenizer);
    if (tokens.state != 'success') {
      context.logger.fail(tokens.reference, tokens.errorMessage);
      return false;
    }

    const allTokensReference = line.tokens.allReference();
    const tokenNames = line.tokens.asArray()
      .map(token => `${token.tokenType}(${token.value})`)
      .join(" ");

    context.logger.log(allTokensReference, ` Tokens: ${tokenNames}`);

    return true;
  }

  private async loadIncludedFiles(context: IParserContext, parentFullFileName: string): Promise<void> {
    let includes = context.rootNode.getDueIncludes();
    for (const include of includes) {
      await this.includeFiles(context, parentFullFileName, include)
    }
  }

  private async includeFiles(context: IParserContext, parentFullFileName: string, include: Include): Promise<void> {

    let fileName = await include.process(parentFullFileName, context);
    if (fileName == null) return;

    if (context.isFileIncluded(fileName)) return;

    context.logger.logInfo(`Parse file: ` + fileName);

    context.addFileIncluded(fileName);

    const document = await this.fileSystem.createFileSourceDocument(fileName);
    await this.parseDocument(document, context);
  }

  private static validateNodesTree(context: IParserContext): void {
    let visitor = new TrackLoggingCurrentNodeVisitor(context.logger);
    let validationContext = new ValidationContext(context.logger, context.nodes, visitor, context.libraries, context.symbols);
    context.rootNode.validateTree(validationContext);
  }

  private sortByDependencyAndCheckCircularDependencies(context: IParserContext): Dependencies {

    let dependencies = DependencyGraphFactory.create(context.nodes);
    if (!dependencies.hasCircularReferences) return dependencies;

    for (const [key, circularReference] of dependencies.circularReferences) {
      context.logger.setCurrentNode(circularReference);
      context.logger.fail(circularReference.reference,
        `Circular reference detected in: '${key}'`);
    }
    return dependencies;
  }

  private reset(context: IParserContext): void {
    context.logger.resetCurrentNode();
  }

  private parseLine(line: Line, context: IParserContext, currentNode: IParsableNode | null,
                    documentSymbols: IDocumentSymbols,
                    nodesPerIndent: ParsableNodeIndex, indent: number): IParsableNode {

    if (currentNode == null) {
      throw new Error(`Current node can't be null. Line: ${line}`)
    }
    let parseLineContext = new ParseLineContext(line, context.logger, documentSymbols, this.expressionFactory);
    currentNode.expandArea(line.endPosition);

    let node = currentNode.parse(parseLineContext);
    if (!node) {
      throw new Error(`(${currentNode}) Parse should return child node or itself.`);
    }

    const componentNode = asComponentNode(node)
    if (componentNode != null) {
      context.logger.setCurrentNode(componentNode);
    } else {
      const parentComponentNode = nodesPerIndent.getParentComponent(indent);
      context.logger.setCurrentNode(parentComponentNode);
    }

    return node;
  }
}
