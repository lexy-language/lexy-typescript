import {IRootNode} from "../../language/rootNode";
import {IRootTokenWriter} from "../IRootTokenWriter";
import {FunctionWriter} from "./writers/functionWriter";
import {NodeType} from "../../language/nodeType";
import {TypeWriter} from "./writers/typeWriter";
import {TableWriter} from "./writers/tableWriter";
import {EnumWriter} from "./writers/enumWriter";
import {Scenario} from "../../language/scenarios/scenario";

export type JavaScriptCodeWriter = {writer: IRootTokenWriter, node: IRootNode} | null;

export class JavaScriptCode {
   public static getWriter(rootNode: IRootNode): JavaScriptCodeWriter {
     switch (rootNode.nodeType) {
       case NodeType.Function:
         return {writer: new FunctionWriter(), node: rootNode};

       case NodeType.EnumDefinition:
         return {writer: new EnumWriter(), node: rootNode};

       case NodeType.Table:
         return {writer: new TableWriter(), node: rootNode};

       case NodeType.TypeDefinition:
         return {writer: new TypeWriter(), node: rootNode};

       case NodeType.Scenario:
         const scenario = rootNode as Scenario;
         if (scenario.functionNode != null) {
           return {writer: new FunctionWriter(), node: scenario.functionNode};
         }
         return null;
       default:
         throw new Error(`No writer defined: '${rootNode.nodeType}'`);
     }
   }
}
