import type {ITypeWithMembers} from "./ITypeWithMembers";
import type {IValidationContext} from "../../parser/validationContext";

import {VariableType} from "./variableType";

export abstract class TypeWithMembers extends VariableType implements ITypeWithMembers {
   public typeWithMember = true;
   public abstract memberType(name: string, context: IValidationContext): VariableType | null;
}
