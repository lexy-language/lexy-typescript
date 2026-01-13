import {ComponentNodeList} from "../language/componentNodeList";
import {IParserLogger} from "./parserLogger";
import {LexyScriptNode} from "../language/lexyScriptNode";
import {Dependencies} from "../dependencyGraph/dependencies";

export class ParserResult {

  public readonly rootNode: LexyScriptNode;
  public readonly componentNodes: ComponentNodeList;
  public readonly logger: IParserLogger;
  public readonly dependencies: Dependencies;

   constructor(rootNode: LexyScriptNode, componentNodes: ComponentNodeList, logger: IParserLogger, dependencies: Dependencies) {
     this.rootNode = rootNode;
     this.componentNodes = componentNodes;
     this.logger = logger;
     this.dependencies = dependencies;
   }
}
