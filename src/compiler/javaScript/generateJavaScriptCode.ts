import type {IComponentNode} from "../../language/componentNode";

import {NodeType} from "../../language/nodeType";
import {createFunctionCode} from "./components/createFunctionCode";
import {createEnumCode} from "./components/createEnumCode";
import {createTableCode} from "./components/createTableCode";
import {createTypeCode} from "./components/createTypeCode";
import {GeneratedType} from "../generatedType";
import {TypeDefinition} from "../../language/types/typeDefinition";
import {Function} from "../../language/functions/function";
import {EnumDefinition} from "../../language/enums/enumDefinition";
import {Table} from "../../language/tables/table";

export function generateJavaScriptCode(componentNode: IComponentNode): GeneratedType | null {
 switch (componentNode.nodeType) {
   case NodeType.Function:
     return createFunctionCode(componentNode as Function);

   case NodeType.EnumDefinition:
     return createEnumCode(componentNode as EnumDefinition);

   case NodeType.Table:
     return createTableCode(componentNode as Table);

   case NodeType.TypeDefinition:
     return createTypeCode(componentNode as TypeDefinition);

   case NodeType.Scenario:
     return null;

   default:
     throw new Error(`No writer defined: '${componentNode.nodeType}'`);
 }
}