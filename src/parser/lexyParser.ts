import type {IParserContext} from "./parserContext";
import type {ITokenizer} from "./tokens/tokenizer";
import type {ISourceCodeDocument} from "./sourceCodeDocument";
import type {IParsableNode} from "../language/parsableNode";
import type {IExpressionFactory} from "../language/expressions/expressionFactory";
import type {IComponentNode} from "../language/componentNode";
import type {IFileSystem} from "../infrastructure/IFileSystem";
import type {ILogger} from "../infrastructure/logger";

import {ParserResult} from "./parserResult";
import {ParsableNodeIndex} from "../language/parsableNodeIndex";
import {ParseLineContext} from "./ParseLineContext";
import {Include} from "../language/include";
import {ValidationContext} from "./validationContext";
import {DependencyGraphFactory} from "../dependencyGraph/dependencyGraphFactory";
import {SourceCodeDocument} from "./sourceCodeDocument";
import {ParserContext} from "./parserContext";
import {ParseOptions} from "./parseOptions";
import {Dependencies} from "../dependencyGraph/dependencies";
import {TrackLoggingCurrentNodeVisitor} from "./TrackLoggingCurrentNodeVisitor";
import {Line} from "./line";

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
    context.setFileLineFilter(fullFileName);

    this.parseDocument(context, code, fullFileName);
    context.logger.logNodes(context.nodes.asArray());

    const dependencyGraph = this.sortByDependencyAndCheckCircularDependencies(context);
    if (dependencyGraph != null) {
      context.rootNode.sortByDependency(dependencyGraph.sortedNodes);
      this.validateNodesTree(context);
    }

    if (context.options.suppressException != true) {
      context.logger.assertNoErrors();
    }

    return new ParserResult(context.nodes, context.logger);
  }

  private parseDocument(context: IParserContext, code: string[], fullFileName: string): void {
    this.sourceCode.setCode(code, this.fileSystem.getFileName(fullFileName));

    let currentIndent = 0;
    let nodesPerIndent = new ParsableNodeIndex(context.rootNode);

    while (this.sourceCode.hasMoreLines()) {
      if (!this.tokenizeLine(context)) {
        currentIndent = this.sourceCode.currentLine?.indent(context.logger) ?? currentIndent;
        continue;
      }

      const line = this.sourceCode.currentLine;
      const indentResult = this.getIndent(context, line);
      if (!indentResult.success) continue;
      const indent = indentResult.value;

      if (indent > currentIndent) {
        context.logger.fail(line.lineStartReference(), `Invalid indent: ${indent}`);
        continue;
      }

      let node = nodesPerIndent.getCurrentOrDescend(indent);
      node = this.parseLine(context, node, nodesPerIndent, indent);

      currentIndent = indent + 1;

      nodesPerIndent.set(currentIndent, node);
    }

    this.reset(context);

    this.loadIncludedFiles(context, fullFileName);
  }

  private getIndent(context: IParserContext, line: Line) {

    if (line.isEmpty()) return {success: false};

    let indent = line.indent(context.logger);
    return indent == null ? {success: false} : {success: true, value: indent};
  }

  private tokenizeLine(context: IParserContext): boolean {
    let line = this.sourceCode.nextLine();
    if (!context.lineFilter.useLine(line.content)) {
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
    let visitor = new TrackLoggingCurrentNodeVisitor(context.logger);
    let validationContext = new ValidationContext(context.logger, context.nodes, visitor);
    context.rootNode.validateTree(validationContext);
  }

  private sortByDependencyAndCheckCircularDependencies(context: IParserContext): Dependencies | null {
    let dependencies = DependencyGraphFactory.create(context.nodes);
    if (!dependencies.hasCircularReferences) return dependencies;

    for (const circularReference of dependencies.circularReferences) {
      context.logger.setCurrentNode(circularReference);
      context.logger.fail(circularReference.reference,
        `Circular reference detected in: '${circularReference.nodeName}'`);
    }
    return null;
  }

  private reset(context: IParserContext): void {
    this.sourceCode.reset();
    context.logger.resetCurrentNode();
  }

  private parseLine(context: IParserContext, currentNode: IParsableNode | null, nodesPerIndent: ParsableNodeIndex, indent: number): IParsableNode {
    if (currentNode == null) {
      throw new Error(`Current node can't be null. Line: ${this.sourceCode.currentLine}`)
    }
    let parseLineContext = new ParseLineContext(this.sourceCode.currentLine, context.logger, this.expressionFactory);
    let node = currentNode != null ? currentNode?.parse(parseLineContext) : null;
    if (node == null) {
      throw new Error(`(${currentNode}) Parse should return child node or itself.`);
    }

    const componentNode = this.asComponentNode(node)
    if (componentNode != null) {
      context.logger.setCurrentNode(componentNode);
    } else {
      const parentComponentNode = nodesPerIndent.getParentComponent(indent);
      context.logger.setCurrentNode(parentComponentNode);
    }

    return node;
  }

  private instanceOfComponentNode(object: any): object is IComponentNode {
    return object?.isComponentNode == true;
  }

  private asComponentNode(object: any): IComponentNode | null {
    return this.instanceOfComponentNode(object) ? object as IComponentNode : null;
  }

}
