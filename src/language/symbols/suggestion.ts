import {Type} from "../typeSystem/type";
import {Assert} from "../../infrastructure/assert";
import {SymbolKind} from "./symbolKind";

export class Suggestion {

  public name: string;
  public kind: SymbolKind;
  public type: Type | null;

  constructor(name: string, kind: SymbolKind, type: Type | null = null) {
    this.name = Assert.notNull(name, "name");
    this.kind = kind;
    this.type = type;
  }

  public toString(): string {
    return this.type == null
      ? `${this.name} (${this.kind})`
      : `${this.type?.typeKind} {Name} (${this.kind})`;
  }
}
