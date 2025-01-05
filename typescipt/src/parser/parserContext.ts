import type {IParserLogger} from "./ParserLogger";

import {SourceCodeNode} from "../language/sourceCodeNode";
import {RootNodeList} from "../language/rootNodeList";
import {contains} from "../infrastructure/enumerableExtensions";
import {IExpressionFactory} from "../language/expressions/expressionFactory";
import {IFileSystem} from "./IFileSystem";

export interface IParserContext {
  logger: IParserLogger;


  fileSystem: IFileSystem;
  nodes: RootNodeList;
  rootNode: SourceCodeNode;

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

   constructor(logger: IParserLogger, fileSystem: IFileSystem, expressionFactory: IExpressionFactory) {
     this.logger = logger;
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
