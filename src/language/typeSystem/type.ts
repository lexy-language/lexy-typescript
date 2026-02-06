import {TypeKind} from "./typeKind";
import {SourceReference} from "../sourceReference";
import {Symbol} from "../symbols/symbol";

export abstract class Type {

  abstract readonly typeKind: TypeKind;
  abstract isAssignableFrom(type: Type): boolean;
  abstract equals(other: Type | null): boolean;

  abstract getSymbol(reference: SourceReference): Symbol;

  public toString(): string {
    return this.typeKind;
  }
}
