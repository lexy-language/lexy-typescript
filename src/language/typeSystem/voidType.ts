import {Type} from "./type";
import {TypeKind} from "./typeKind";

export class VoidType extends Type {

  public readonly typeKind = TypeKind.VoidType;

  override isAssignableFrom(type: Type): boolean {
    return this.equals(type);
  }

  equals(other: Type | null): boolean {
    return this.typeKind == other?.typeKind;
  }
}
