import {Signatures} from "./signatures";
import {SourceReference} from "../sourceReference";
import {Assert} from "../../infrastructure/assert";
import {SymbolKind} from "./symbolKind";

export class Symbol {

  public readonly name: string
  public readonly description: string;
  public readonly kind: SymbolKind;
  public readonly signatures: Signatures | null;
  public readonly reference: SourceReference;

  constructor(reference: SourceReference, name: string, description: string, kind: SymbolKind, signatures: Signatures | null = null) {
    this.reference = Assert.notNull(reference, "reference");
    this.name = Assert.notNull(name, "name");
    this.description = description;
    this.kind = kind;
    this.signatures = signatures;
  }

  public toString(): string {
    let value = this.description && this.description != "" ? `${this.name}: ${this.description}` : this.name;
    return this.signatures != null ? `value - ${this.signatures.toString()}` : value;
  }
}
