import {ComponentNodeList} from "../language/componentNodeList";
import {IParserLogger} from "./parserLogger";

export class ParserResult {
  public readonly componentNodes: ComponentNodeList;
  public readonly logger: IParserLogger;

   constructor(componentNodes: ComponentNodeList, logger: IParserLogger) {
     this.componentNodes = componentNodes;
     this.logger = logger;
   }
}
