import {SymbolKind} from "../../language/symbols/symbolKind"

export class SymbolDescription {

  public readonly name: string;
  public readonly description: string;
  public readonly kind: SymbolKind;

  constructor(name: string, description: string, kind: SymbolKind) {
    this.name = name;
    this.description = description;
    this.kind = kind;
  }

  public toString(): string {
    return `${this.name} (${this.kind}): ${this.description}`
  }
}
