import {ComponentNodeList} from "../language/componentNodeList";
import {IParserLogger} from "./logging/parserLogger";
import {LexyScriptNode} from "../language/lexyScriptNode";
import {Dependencies} from "../dependencyGraph/dependencies";
import {DocumentsSymbols} from "./symbols/documentsSymbols";

export class ParserResult {

  public readonly rootNode: LexyScriptNode;
  public readonly componentNodes: ComponentNodeList;
  public readonly logger: IParserLogger;
  public readonly dependencies: Dependencies;
  public readonly documentsSymbols: DocumentsSymbols;

   constructor(rootNode: LexyScriptNode, componentNodes: ComponentNodeList,
               logger: IParserLogger, dependencies: Dependencies,
               documentsSymbols: DocumentsSymbols) {
     this.rootNode = rootNode;
     this.componentNodes = componentNodes;
     this.logger = logger;
     this.dependencies = dependencies;
     this.documentsSymbols = documentsSymbols;
   }
}
