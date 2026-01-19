import {Type} from "../type";

export enum ObjectMemberKind {
   Function = "Function",
   Variable = "Variable",
   NestedType = "NestedType",
}

export interface IObjectMember {
   kind: ObjectMemberKind,
   name: string,
   type: Type | null,
}
