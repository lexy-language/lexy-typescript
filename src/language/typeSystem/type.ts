import {TypeKind} from "./typeKind";

export abstract class Type {

  abstract readonly typeKind: TypeKind;
  abstract isAssignableFrom(type: Type): boolean;
  abstract equals(other: Type | null): boolean;

  public toString(): string {
    return this.typeKind;
  }
}
