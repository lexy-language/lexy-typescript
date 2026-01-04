import type {ITypeWithMembers} from "./ITypeWithMembers";
import type {IComponentNodeList} from "../componentNodeList";
import type {IInstanceFunction} from "../functions/IInstanceFunction";

import {VariableType} from "./variableType";

export abstract class TypeWithMembers extends VariableType implements ITypeWithMembers {

   public typeWithMember = true;

   public abstract memberType(name: string, componentNodes: IComponentNodeList): VariableType | null;

   public getFunction(name: string): IInstanceFunction | null {
      return null;
   }
}
