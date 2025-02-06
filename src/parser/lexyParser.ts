import type {IParserContext} from "./parserContext";
import type {ITokenizer} from "./tokens/tokenizer";
import type {ISourceCodeDocument} from "./sourceCodeDocument";
import type {IParsableNode} from "../language/parsableNode";
import type {IExpressionFactory} from "../language/expressions/expressionFactory";
import type {IRootNode} from "../language/rootNode";
import type {IFileSystem} from "../infrastructure/IFileSystem";
import type {ILogger} from "../infrastructure/logger";

import {ParserResult} from "./parserResult";
import {ParsableNodeArray} from "../language/parsableNodeArray";
import {ParseLineContext} from "./ParseLineContext";
import {Include} from "../language/include";
import {ValidationContext} from "./validationContext";
import {DependencyGraphFactory} from "../dependencyGraph/dependencyGraphFactory";
import {SourceCodeDocument} from "./sourceCodeDocument";
import {ParserContext} from "./parserContext";
import {ParseOptions} from "./parseOptions";

export interface ILexyParser {
  parseFile(fileName: string, options: ParseOptions | null): ParserResult;
  parse(code: string[], fileName: string, options: ParseOptions | null): ParserResult;
}

export class LexyParser implements ILexyParser {
  private readonly tokenizer: ITokenizer;
  private readonly baseLogger: ILogger;
  private readonly sourceCode: ISourceCodeDocument;
  private readonly fileSystem: IFileSystem;
  private readonly expressionFactory: IExpressionFactory;

  constructor(baseLogger: ILogger, tokenizer: ITokenizer, fileSystem: IFileSystem, expressionFactory: IExpressionFactory) {
    this.baseLogger = baseLogger;
    this.tokenizer = tokenizer;
    this.fileSystem = fileSystem;
    this.expressionFactory = expressionFactory;
    this.sourceCode = new SourceCodeDocument();
  }

  public parseFile(fileName: string, options: ParseOptions | null): ParserResult {
    const fullFileName = this.fileSystem.isPathRooted(fileName)
      ? fileName
      : this.fileSystem.getFullPath(fileName);

    this.baseLogger.logInformation(`Parse file: ` + fullFileName);

    const code = this.fileSystem.readAllLines(fullFileName);
    return this.parse(code, fileName, options);
  }

  public parse(code: string[], fullFileName: string, options: ParseOptions | null): ParserResult {
    const context = new ParserContext(this.baseLogger, this.fileSystem, this.expressionFactory, options);
    context.addFileIncluded(fullFileName);

    this.parseDocument(context, code, fullFileName);
    context.logger.logNodes(context.nodes.asArray());

    this.validateNodesTree(context);
    this.detectCircularDependencies(context);

    if (context.options.suppressException != true) {
      context.logger.assertNoErrors();
    }

    return new ParserResult(context.nodes, context.logger);
  }

  private parseDocument(context: IParserContext, code: string[], fullFileName: string): void {
    this.sourceCode.setCode(code, this.fileSystem.getFileName(fullFileName));

    let currentIndent = 0;
    let nodePerIndent = new ParsableNodeArray(context.rootNode);

    while (this.sourceCode.hasMoreLines()) {
      if (!this.processLine(context)) {
        currentIndent = this.sourceCode.currentLine?.indent(context.logger) ?? currentIndent;
        continue;
      }

      let line = this.sourceCode.currentLine;
      if (line.isEmpty()) continue;

      let indent = line.indent(context.logger);
      if (indent == null) continue;

      if (indent > currentIndent) {
        context.logger.fail(line.lineStartReference(), `Invalid indent: ${indent}`);
        continue;
      }

      let node = nodePerIndent.get(indent);
      node = this.parseLine(context, node);

      currentIndent = indent + 1;

      nodePerIndent.set(currentIndent, node);
    }

    this.reset(context);

    this.loadIncludedFiles(context, fullFileName);
  }

  private processLine(context: IParserContext): boolean {
    let line = this.sourceCode.nextLine();
    if (context.options.lineFilter != undefined && !context.options.lineFilter.useLine(line.content)) {
      context.logger.log(line.lineStartReference(), `Skip line by filter: '${line.content}'`);
      return false;
    }

    context.logger.log(line.lineStartReference(), `'${line.content}'`);

    let tokens = line.tokenize(this.tokenizer);
    if (tokens.state != 'success') {
      context.logger.fail(tokens.reference, tokens.errorMessage);
      return false;
    }

    const tokenNames = this.sourceCode.currentLine.tokens.asArray()
      .map(token => `${token.tokenType}(${token.value})`)
      .join(" ");

    context.logger.log(line.lineStartReference(), ` Tokens: ` + tokenNames);

    return true;
  }

  private loadIncludedFiles(context: IParserContext, parentFullFileName: string): void {
    let includes = context.rootNode.getDueIncludes();
    for (const include of includes) {
      this.includeFiles(context, parentFullFileName, include)
    }
  }

  private includeFiles(context: IParserContext, parentFullFileName: string, include: Include): void {
    let fileName = include.process(parentFullFileName, context);
    if (fileName == null) return;

    if (context.isFileIncluded(fileName)) return;

    context.logger.logInfo(`Parse file: ` + fileName);

    const code = this.fileSystem.readAllLines(fileName);

    context.addFileIncluded(fileName);

    this.parseDocument(context, code, fileName);
  }

  private validateNodesTree(context: IParserContext): void {
    let validationContext = new ValidationContext(context.logger, context.nodes);
    context.rootNode.validateTree(validationContext);
  }

  private detectCircularDependencies(context: IParserContext): void {
    let dependencies = DependencyGraphFactory.create(context.nodes);
    if (!dependencies.hasCircularReferences) return;

    for (const circularReference of dependencies.circularReferences) {
      context.logger.setCurrentNode(circularReference);
      context.logger.fail(circularReference.reference,
        `Circular reference detected in: '${circularReference.nodeName}'`);
    }
  }

  private reset(context: IParserContext): void {
    this.sourceCode.reset();
    context.logger.resetCurrentNode();
  }

  private parseLine(context: IParserContext, currentNode: IParsableNode | null): IParsableNode {
    let parseLineContext = new ParseLineContext(this.sourceCode.currentLine, context.logger, this.expressionFactory);
    let node = currentNode != null ? currentNode?.parse(parseLineContext) : null;
    if (node == null) {
      throw new Error(`(${currentNode}) Parse should return child node or itself.`);
    }

    const rootNode = this.asRootNode(node)
    if (rootNode != null) {
      context.logger.setCurrentNode(rootNode);
    }

    return node;
  }

  private instanceOfRootNode(object: any): object is IRootNode {
    return object?.isRootNode == true;
  }

  private asRootNode(object: any): IRootNode | null {
    return this.instanceOfRootNode(object) ? object as IRootNode : null;
  }

}
