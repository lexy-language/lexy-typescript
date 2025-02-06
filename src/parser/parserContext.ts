import type {IParserLogger} from "./parserLogger";
import type {IExpressionFactory} from "../language/expressions/expressionFactory";
import type {IFileSystem} from "../infrastructure/IFileSystem";
import type {ILogger} from "../infrastructure/logger";

import {SourceCodeNode} from "../language/sourceCodeNode";
import {RootNodeList} from "../language/rootNodeList";
import {contains} from "../infrastructure/enumerableExtensions";
import {ParserLogger} from "./parserLogger";
import {ParseOptions} from "./parseOptions";

export interface IParserContext {
  logger: IParserLogger;

  fileSystem: IFileSystem;
  nodes: RootNodeList;
  rootNode: SourceCodeNode;
  options: ParseOptions;

  addFileIncluded(fileName: string): void;
  isFileIncluded(fileName: string ): boolean;
}

export class ParserContext implements IParserContext {

   private readonly includedFiles: Array<string> = [];

   public get nodes(): RootNodeList {
     return this.rootNode.rootNodes;
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
}
