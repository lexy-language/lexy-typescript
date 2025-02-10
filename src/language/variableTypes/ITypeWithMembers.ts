import type {IRootNodeList} from "../rootNodeList";

import {VariableType} from "./variableType";

export function instanceOfTypeWithMembers(object: any): object is ITypeWithMembers {
   return object?.typeWithMember == true;
}

export function asTypeWithMembers(object: any): ITypeWithMembers | null {
   return instanceOfTypeWithMembers(object) ? object as ITypeWithMembers : null;
}

export interface ITypeWithMembers {
   typeWithMember: boolean;
   memberType(name: string , rootNodes: IRootNodeList): VariableType | null;
}
