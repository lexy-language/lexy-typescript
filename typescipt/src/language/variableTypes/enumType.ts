import {TypeWithMembers} from "./typeWithMembers";
import {EnumDefinition} from "../enums/enumDefinition";
import {VariableType} from "./variableType";
import {IValidationContext} from "../../parser/validationContext";
import {any} from "../../infrastructure/enumerableExtensions";

export function instanceOfEnumType(object: any): object is EnumType {
  return object?.variableTypeName == "EnumType";
}

export function asEnumType(object: any): EnumType | null {
  return instanceOfEnumType(object) ? object as EnumType : null;
}

export class EnumType extends TypeWithMembers {

  public readonly variableTypeName: "EnumType";

  public type: string;
   public enum: EnumDefinition;

   constructor(type: string, enumDefinition: EnumDefinition) {
     super();
     this.type = type;
     this.enum = enumDefinition;
   }

   protected equals(other: EnumType): boolean {
     return this.type == other?.type;
   }

   public override toString(): string {
     return this.type;
   }

   public override memberType(name: string, context: IValidationContext): VariableType | null {
     return any(this.enum.members, member => member.name == name) ? this : null;
   }
}
