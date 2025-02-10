import type {ITypeWithMembers} from "./ITypeWithMembers";
import type {IRootNodeList} from "../rootNodeList";

import {VariableType} from "./variableType";

export abstract class TypeWithMembers extends VariableType implements ITypeWithMembers {
   public typeWithMember = true;
   public abstract memberType(name: string, rootNodes: IRootNodeList): VariableType | null;
}
