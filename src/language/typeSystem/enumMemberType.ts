import {EnumDefinition} from "../enums/enumDefinition";
import {Type} from "./type";
import {TypeKind} from "./typeKind";

export function instanceOfEnumMemberType(object: any): object is EnumMemberType {
  return object?.typeKind == TypeKind.EnumMemberType;
}

export function asEnumMemberType(object: any): EnumMemberType | null {
  return instanceOfEnumMemberType(object) ? object as EnumMemberType : null;
}

export class EnumMemberType extends Type {

  public readonly typeKind = TypeKind.EnumMemberType;

  public enum: EnumDefinition;

  constructor(enumDefinition: EnumDefinition) {
    super();
    this.enum = enumDefinition;
  }

  public override isAssignableFrom(type: Type): boolean {
    return type.equals(this.enum.createType());
  }

  equals(other: Type | null): boolean {
    if (other != null) return false;

    let enumMemberType = asEnumMemberType(other);
    return enumMemberType != null && enumMemberType.enum.name == this.enum.name;
  }
}
