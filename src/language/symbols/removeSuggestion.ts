import {Assert} from "../../infrastructure/assert";
import {SuggestionEdit} from "./suggestionEdit";
import {SuggestionsScope} from "./suggestionsScope";
import {Suggestion} from "./suggestion";
import {SymbolKind} from "./symbolKind";

export class RemoveSuggestion extends SuggestionEdit {

  public readonly name: string;
  public readonly kind: SymbolKind;

  constructor(name: string, kind: SymbolKind) {
    super(SuggestionsScope.Children)
    this.name = Assert.notNull(name, "name");
    this.kind = kind;
  }

  public override update(suggestions: Suggestion[]): void {
    let index = suggestions.findIndex(where => where.name == this.name);
    if (index >= 0) {
      suggestions.splice(index, 1);
    }
  }

  public override toString(): string {
    return `Remove: (${this.kind}) ${this.name}`;
  }
}
