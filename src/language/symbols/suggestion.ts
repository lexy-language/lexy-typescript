import {Type} from "../typeSystem/type";
import {Assert} from "../../infrastructure/assert";
import {SymbolKind} from "./symbolKind";

export class Suggestion {

  public name: string;
  public description: string | null;
  public kind: SymbolKind;
  public type: Type | null;

  constructor(name: string, description: string | null, kind: SymbolKind, type: Type | null = null) {
    this.name = Assert.notNull(name, "name");
    this.description = description;
    this.kind = kind;
    this.type = type;
  }

  public toString(): string {
    const suffix = this.description ? `: ${this.description}` : "";
    return this.type == null
      ? `${this.name} (${this.kind})${suffix}`
      : `${this.type?.typeKind} ${this.name} (${this.kind})${suffix}`;
  }
}
