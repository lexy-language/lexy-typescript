import {ComponentNodeList} from "../language/componentNodeList";
import {IParserLogger} from "./parserLogger";
import {LexyScriptNode} from "../language/lexyScriptNode";

export class ParserResult {

  public readonly rootNode: LexyScriptNode;
  public readonly componentNodes: ComponentNodeList;
  public readonly logger: IParserLogger;

   constructor(rootNode: LexyScriptNode, componentNodes: ComponentNodeList, logger: IParserLogger) {
     this.rootNode = rootNode;
     this.componentNodes = componentNodes;
     this.logger = logger;
   }
}
