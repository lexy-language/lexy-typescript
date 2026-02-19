import type {IParserContext} from "./context/parserContext";
import type {ITokenizer} from "./tokens/tokenizer";
import type {IParsableNode} from "../language/parsableNode";
import type {IFileSystem} from "../infrastructure/IFileSystem";
import type {ILogger} from "../infrastructure/logger";
import type {IFile} from "../infrastructure/file";
import type {IProject} from "../infrastructure/project";

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
import {IDocumentSymbols} from "./symbols/documentSymbols";
import {Project} from "../infrastructure/project";
import {initializeExpressionFactory} from "../language/expressions/initializeExpressionFactory";

export interface ILexyParser {
  parseCode(fileName: string, content: string[], options: ParseOptions | null): Promise<ParserResult>;
  parseFile(file: IFile, options: ParseOptions | null): Promise<ParserResult>;
  parseFiles(fileNames: readonly string[], options: ParseOptions | null): Promise<ParserResult>;
  parseDocuments(project: IProject, sourceCodeDocuments: readonly ISourceCodeDocument[], options: ParseOptions | null): Promise<ParserResult>;
}

export class LexyParser implements ILexyParser {

  private readonly tokenizer: ITokenizer;
  private readonly baseLogger: ILogger;
  private readonly fileSystem: IFileSystem;
  private readonly libraries: ILibraries;

  constructor(baseLogger: ILogger, tokenizer: ITokenizer,
              fileSystem: IFileSystem, libraries: ILibraries) {

    initializeExpressionFactory();

    this.baseLogger = baseLogger;
    this.tokenizer = tokenizer;
    this.fileSystem = fileSystem;
    this.libraries = Assert.notNull(libraries, "libraries");
  }

  public async parseCode(fileName: string, content: string[], options: ParseOptions | null): Promise<ParserResult> {

    Assert.notNull(fileName, "fileName");
    Assert.notNull(content, "content");
    Assert.notNull(options, "options");

    this.baseLogger.logInformation(`Parse code: ${fileName}`);

    const project = new Project(this.fileSystem);
    const document = new StringSourceCodeDocument(content, project.file(fileName));
    return await this.parseDocuments(project, [document], options);
  }

  public async parseFile(file: IFile, options: ParseOptions | null): Promise<ParserResult> {

    Assert.notNull(file, "file");
    Assert.notNull(options, "options");

    this.baseLogger.logInformation(`Parse file: ${file.name}`);

    const document = await this.fileSystem.createFileSourceDocument(file);
    try {
      return await this.parseDocuments(file.project, [document], options);
    } catch (error) {
      document.dispose();
      throw error;
    }
  }

  public async parseFiles(fileNames: readonly string[], options: ParseOptions | null): Promise<ParserResult> {

    Assert.notNull(fileNames, "fileNames");
    Assert.notNull(options, "options");

    this.baseLogger.logInformation(`Parse files: ${fileNames.join(", ")}`);

    const project = new Project(this.fileSystem);
    const files = fileNames.map(fileName => project.file(fileName));
    const documents = await this.fileSystem.createFileSourceDocuments(files);

    try {
      return await this.parseDocuments(project, documents.documents, options);
    } catch (error) {
      documents.dispose();
      throw error;
    }
  }

  public async parseDocuments(project: IProject, sourceCodeDocuments: readonly ISourceCodeDocument[], options: ParseOptions | null): Promise<ParserResult> {

    Assert.notNull(sourceCodeDocuments, "sourceCodeDocuments");

    const context = new ParserContext(project, this.baseLogger, this.fileSystem, this.libraries, options);

    for (const sourceCodeDocument of sourceCodeDocuments) {
      context.addFileIncluded(sourceCodeDocument.file);
      context.setFileLineFilter(sourceCodeDocument.file);

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
    const symbols = context.symbols.document(sourceCodeDocument.file);

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

    await this.loadIncludedFiles(sourceCodeDocument.file, context);
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

  private async loadIncludedFiles(parentFile: IFile, context: IParserContext): Promise<void> {
    let includes = context.rootNode.getDueIncludes();
    for (const include of includes) {
      await this.includeFiles(parentFile, context, include)
    }
  }

  private async includeFiles(parentFile: IFile, context: IParserContext, include: Include): Promise<void> {

    let file = await include.process(parentFile, context);
    if (file == null) return;

    if (context.isFileIncluded(file)) return;

    context.logger.logInfo(`Parse file: ` + file);

    context.addFileIncluded(file);

    const document = await this.fileSystem.createFileSourceDocument(file);
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
    let parseLineContext = new ParseLineContext(line, context.logger, documentSymbols);
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
