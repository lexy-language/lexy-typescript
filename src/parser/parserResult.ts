import {ComponentNodeList} from "../language/componentNodeList";
import {IParserLogger} from "./logging/parserLogger";
import {LexyScriptNode} from "../language/lexyScriptNode";
import {Dependencies} from "../dependencyGraph/dependencies";
import {ISymbols} from "./symbols/symbols";

export class ParserResult {

  public readonly rootNode: LexyScriptNode;
  public readonly componentNodes: ComponentNodeList;
  public readonly logger: IParserLogger;
  public readonly dependencies: Dependencies;
  public readonly documentsSymbols: ISymbols;

   constructor(rootNode: LexyScriptNode, componentNodes: ComponentNodeList,
               logger: IParserLogger, dependencies: Dependencies,
               documentsSymbols: ISymbols) {
     this.rootNode = rootNode;
     this.componentNodes = componentNodes;
     this.logger = logger;
     this.dependencies = dependencies;
     this.documentsSymbols = documentsSymbols;
   }
}
