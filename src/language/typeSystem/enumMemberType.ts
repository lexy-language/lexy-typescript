import {EnumDefinition} from "../enums/enumDefinition";
import {Type} from "./type";
import {TypeKind} from "./typeKind";
import {SourceReference} from "../sourceReference";
import {Symbol} from "../symbols/symbol";
import {SymbolKind} from "../symbols/symbolKind";

export function instanceOfEnumMemberType(object: any): object is EnumMemberType {
  return object?.typeKind == TypeKind.EnumMemberType;
}

export function asEnumMemberType(object: any): EnumMemberType | null {
  return instanceOfEnumMemberType(object) ? object as EnumMemberType : null;
}

export class EnumMemberType extends Type {

  public readonly typeKind = TypeKind.EnumMemberType;

  public enumDefintion: EnumDefinition;
  public name: string;

  constructor(enumDefinition: EnumDefinition, name: string) {
    super();
    this.name = name;
    this.enumDefintion = enumDefinition;
  }

  public override isAssignableFrom(type: Type): boolean {
    return type.equals(this.enumDefintion.createType());
  }

  equals(other: Type | null): boolean {
    if (other != null) return false;

    let enumMemberType = asEnumMemberType(other);
    return enumMemberType != null && enumMemberType.enumDefintion.name == this.enumDefintion.name;
  }

  public override toString(): string  {
    return `${this.enumDefintion.name}.${this.name}`;
  }

  public override getSymbol(reference: SourceReference): Symbol {
    return new Symbol(reference, `enum member: ${this.enumDefintion.name}.${this.name}`, "", SymbolKind.EnumMember);
  }
}
