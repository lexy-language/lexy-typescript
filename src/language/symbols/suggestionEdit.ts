import {SuggestionsScope} from "./suggestionsScope";
import {Suggestion} from "./suggestion";

export abstract class SuggestionEdit {

  public readonly scope: SuggestionsScope;

  protected constructor(scope: SuggestionsScope) {
    this.scope = scope;
  }

  public abstract update(suggestions: Suggestion[]): void;
}
