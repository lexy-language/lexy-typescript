import type {IComponentNodeList} from "../componentNodeList";

import {VariableType} from "./variableType";
import {IInstanceFunction} from "../functions/IInstanceFunction";

export function instanceOfTypeWithMembers(object: any): object is ITypeWithMembers {
   return object?.typeWithMember == true;
}

export function asTypeWithMembers(object: any): ITypeWithMembers | null {
   return instanceOfTypeWithMembers(object) ? object as ITypeWithMembers : null;
}

export interface ITypeWithMembers {
   typeWithMember: boolean;
   memberType(name: string , componentNodes: IComponentNodeList): VariableType | null;
   getFunction(name: string): IInstanceFunction | null;
}
