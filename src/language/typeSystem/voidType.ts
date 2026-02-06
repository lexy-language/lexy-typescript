import {Type} from "./type";
import {TypeKind} from "./typeKind";
import {SourceReference} from "../sourceReference";
import {Symbol} from "../symbols/symbol";
import {SymbolKind} from "../symbols/symbolKind";

export class VoidType extends Type {

  public readonly typeKind = TypeKind.VoidType;

  override isAssignableFrom(type: Type): boolean {
    return this.equals(type);
  }

  equals(other: Type | null): boolean {
    return this.typeKind == other?.typeKind;
  }

  public override toString(): string  {
    return "void";
  }

  public override getSymbol(reference: SourceReference): Symbol {
    return new Symbol(reference, this.toString(), "", SymbolKind.Type);
  }
}
