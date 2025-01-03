import {TypeWithMembers} from "./typeWithMembers";
import {TypeDefinition} from "../types/typeDefinition";
import {TableType} from "./tableType";
import {IValidationContext} from "../../parser/validationContext";
import {VariableType} from "./variableType";
import {firstOrDefault} from "../../infrastructure/enumerableExtensions";

export function instanceOfCustomType(object: any): object is CustomType {
  return object?.variableTypeName == "CustomType";
}

export function asCustomType(object: any): CustomType | null {
  return instanceOfCustomType(object) ? object as CustomType : null;
}

export class CustomType extends TypeWithMembers {

  public readonly variableTypeName: "CustomType";
   public type: string;
   public typeDefinition: TypeDefinition;

   constructor(type: string, typeDefinition: TypeDefinition) {
     super();
     this.type = type;
     this.typeDefinition = typeDefinition;
   }

   protected equals(other: TableType): boolean {
     return this.type == other?.type;
   }

   public override toString(): string {
     return this.type;
   }

   public override memberType(name: string, context: IValidationContext): VariableType | null {
     const definition = firstOrDefault(this.typeDefinition.variables, variable => variable.name == name);
     const variableType = definition?.type.createVariableType(context);
     return variableType ? variableType : null;
   }
}
