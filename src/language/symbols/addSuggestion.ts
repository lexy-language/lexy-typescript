import {Type} from "../typeSystem/type";
import {Assert} from "../../infrastructure/assert";
import {SuggestionEdit} from "./suggestionEdit";
import {SuggestionsScope} from "./suggestionsScope";
import {Suggestion} from "./suggestion";
import {SymbolKind} from "./symbolKind";

export class AddSuggestion extends SuggestionEdit {

  public readonly name: string;
  public readonly kind: SymbolKind;
  public readonly type: Type | null;

  constructor(scope: SuggestionsScope, name: string, kind: SymbolKind, type: Type | null) {
    super(scope)
    this.name = Assert.notNull(name, "name");
    this.kind = kind;
    this.type = type;
  }

  public override update(suggestions: Suggestion[]): void {
    suggestions.push(new Suggestion(this.name, this.kind, this.type));
  }

  public override toString(): string {
    return `Add: (${this.kind}) ${this.type} ${this.name}`;
  }
}
