import {IComponentNode} from "../../language/componentNode";
import {IComponentTokenWriter} from "../IComponentTokenWriter";
import {FunctionWriter} from "./writers/functionWriter";
import {NodeType} from "../../language/nodeType";
import {TypeWriter} from "./writers/typeWriter";
import {TableWriter} from "./writers/tableWriter";
import {EnumWriter} from "./writers/enumWriter";
import {Scenario} from "../../language/scenarios/scenario";

export type JavaScriptCodeWriter = {writer: IComponentTokenWriter, node: IComponentNode} | null;

export class JavaScriptCode {
   public static getWriter(componentNode: IComponentNode): JavaScriptCodeWriter {
     switch (componentNode.nodeType) {
       case NodeType.Function:
         return {writer: new FunctionWriter(), node: componentNode};

       case NodeType.EnumDefinition:
         return {writer: new EnumWriter(), node: componentNode};

       case NodeType.Table:
         return {writer: new TableWriter(), node: componentNode};

       case NodeType.TypeDefinition:
         return {writer: new TypeWriter(), node: componentNode};

       case NodeType.Scenario:
         const scenario = componentNode as Scenario;
         if (scenario.functionNode != null) {
           return {writer: new FunctionWriter(), node: scenario.functionNode};
         }
         return null;
       default:
         throw new Error(`No writer defined: '${componentNode.nodeType}'`);
     }
   }
}
