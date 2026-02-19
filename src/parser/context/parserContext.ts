import type {IParserLogger} from "../logging/parserLogger";
import type {IFileSystem} from "../../infrastructure/IFileSystem";
import type {ILogger} from "../../infrastructure/logger";
import type {ILibraries} from "../../functionLibraries/libraries";
import type {ISymbols} from "../symbols/symbols";

import {LexyScriptNode} from "../../language/lexyScriptNode";
import {ComponentNodeList} from "../../language/componentNodeList";
import {contains} from "../../infrastructure/arrayFunctions";
import {ParseOptions} from "../parseOptions";
import {Assert} from "../../infrastructure/assert";
import {ParserLogger} from "../logging/parserLogger";
import {Symbols} from "../symbols/symbols";
import {IFile} from "../../infrastructure/file";
import {IProject} from "../../infrastructure/project";
import {LexySourceDocument} from "../lexySourceDocument";

export interface ILineFilter {
  useLine(content: string): boolean;
}

export interface IParserContext {

  libraries: ILibraries;
  logger: IParserLogger;

  fileSystem: IFileSystem;
  symbols: ISymbols;

  nodes: ComponentNodeList;
  rootNode: LexyScriptNode;

  lineFilter: ILineFilter;
  project: IProject;

  addFileIncluded(file: IFile): void;
  isFileIncluded(file: IFile): boolean;
}

export class ParserContext implements IParserContext {

  private readonly includedFiles: Array<string> = [];
  private defaultLexyLineFilter = {useLine: () => true};
  private markdownLineFilter = ParserContext.newMarkdownLineFilter();
  private lineFilterValue: ILineFilter;

  public get nodes(): ComponentNodeList {
    return this.rootNode.componentNodes;
  }

  public get lineFilter() {
    return this.lineFilterValue;
  }

  public readonly libraries: ILibraries;
  public readonly rootNode: LexyScriptNode;
  public readonly logger: IParserLogger;
  public readonly fileSystem: IFileSystem;
  public readonly options: ParseOptions;
  public readonly symbols: ISymbols;

  public readonly project: IProject;

  constructor(project: IProject, logger: ILogger, fileSystem: IFileSystem, libraries: ILibraries, options: ParseOptions | null) {
    this.project = Assert.notNull(project, "project");
    this.options = options ?? {suppressException: false};
    this.logger = new ParserLogger(logger);
    this.libraries = Assert.notNull(libraries, "libraries")
    this.fileSystem = fileSystem;
    this.rootNode = new LexyScriptNode(project);
    this.lineFilterValue = this.defaultLexyLineFilter;
    this.symbols = new Symbols(this.rootNode);
  }

  public addFileIncluded(file: IFile): void {
    this.includedFiles.push(file.fullPath);
  }

  public isFileIncluded(file: IFile): boolean {
    return contains(this.includedFiles, file.fullPath);
  }

  public setFileLineFilter(file: IFile) {
    this.lineFilterValue = file.name.endsWith(LexySourceDocument.markdownExtension)
      ? this.markdownLineFilter
      : this.defaultLexyLineFilter;
  }

  private static newMarkdownLineFilter() {
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
