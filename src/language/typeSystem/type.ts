import {TypeKind} from "./typeKind";
import {SourceReference} from "../sourceReference";
import {Symbol} from "../symbols/symbol";

export abstract class Type {

  public abstract readonly typeKind: TypeKind;
  public abstract isAssignableFrom(type: Type): boolean;
  public abstract equals(other: Type | null): boolean;

  public abstract getSymbol(reference: SourceReference): Symbol;

  public toString(): string {
    return this.typeKind;
  }
}
