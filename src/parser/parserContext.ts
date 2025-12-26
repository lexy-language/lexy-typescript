import type {IParserLogger} from "./parserLogger";
import {ParserLogger} from "./parserLogger";
import type {IExpressionFactory} from "../language/expressions/expressionFactory";
import type {IFileSystem} from "../infrastructure/IFileSystem";
import type {ILogger} from "../infrastructure/logger";

import {SourceCodeNode} from "../language/sourceCodeNode";
import {RootNodeList} from "../language/rootNodeList";
import {contains} from "../infrastructure/arrayFunctions";
import {ParseOptions} from "./parseOptions";

export interface ILineFilter {
  useLine(content: string): boolean;
}

export interface IParserContext {
  logger: IParserLogger;

  fileSystem: IFileSystem;
  nodes: RootNodeList;
  rootNode: SourceCodeNode;
  lineFilter: ILineFilter;

  addFileIncluded(fileName: string): void;

  isFileIncluded(fileName: string): boolean;
}

export class ParserContext implements IParserContext {

  private readonly includedFiles: Array<string> = [];
  private defaultLexyLineFilter = {useLine: () => true};
  private lineFilterValue: ILineFilter;

  public get nodes(): RootNodeList {
    return this.rootNode.rootNodes;
  }

  public get lineFilter() {
    return this.lineFilterValue;
  }

  public readonly rootNode: SourceCodeNode;
  public readonly logger: IParserLogger;
  public readonly fileSystem: IFileSystem;
  public readonly options: ParseOptions;

  constructor(logger: ILogger, fileSystem: IFileSystem, expressionFactory: IExpressionFactory, options: ParseOptions | null) {
    this.options = options ?? {};
    this.logger = new ParserLogger(logger);
    this.fileSystem = fileSystem;
    this.rootNode = new SourceCodeNode(expressionFactory);
    this.lineFilterValue = this.defaultLexyLineFilter;
  }

  public addFileIncluded(fileName: string): void {
    let path = this.normalizePath(fileName);

    this.includedFiles.push(path);
  }

  public isFileIncluded(fileName: string): boolean {
    return contains(this.includedFiles, this.normalizePath(fileName));
  }

  private normalizePath(fileName: string): string {
    return this.fileSystem.getFullPath(fileName);
  }

  public setFileLineFilter(fileName: string) {
    this.lineFilterValue = fileName.endsWith('md') ? this.newMarkdownLineFilter() : this.defaultLexyLineFilter;
  }

  private newMarkdownLineFilter() {
    let inCodeBlock = false;
    const useLine = (line: string) => {
      if (line.trim() === '```') {
        inCodeBlock = !inCodeBlock;
        return false;
      }
      return inCodeBlock;
    };
    return {
      useLine: useLine
    }
  }
}
