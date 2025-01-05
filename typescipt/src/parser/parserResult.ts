import {RootNodeList} from "../language/rootNodeList";

export class ParserResult {
   public readonly rootNodes: RootNodeList

   constructor(rootNodes: RootNodeList) {
     this.rootNodes = rootNodes;
   }
}
