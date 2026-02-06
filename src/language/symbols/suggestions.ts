import {SuggestionsScope} from "./suggestionsScope";
import {SymbolKind} from "./symbolKind";
import {Type} from "../typeSystem/type";
import {AddSuggestion} from "./addSuggestion";
import {RemoveSuggestion} from "./removeSuggestion";
import {SuggestionEdit} from "./suggestionEdit";

export class Suggestions {

  private readonly values: SuggestionEdit[] = [];
  private readonly scope: SuggestionsScope;

  constructor(scope: SuggestionsScope = SuggestionsScope.Children) {
    this.scope = scope;
  }

  public static editScope(scope: SuggestionsScope, handler: (suggestions: Suggestions) => void): SuggestionEdit[] {
    let builder = new Suggestions(scope);
    handler(builder);
    return builder.values;
  }

  public static edit(handler: (suggestions: Suggestions) => void): readonly SuggestionEdit[] {
    let builder = new Suggestions();
    handler(builder);
    return builder.values;
  }

  public keyword(name: string): Suggestions {
    return this.add(name, SymbolKind.Keyword);
  }

  public parameter(name: string, type: Type): Suggestions {
    return this.add(name, SymbolKind.ParameterVariable, type);
  }

  public result(name: string, type: Type): Suggestions {
    return this.add(name, SymbolKind.ResultVariable, type);
  }

  public variable(name: string, type: Type): Suggestions {
    return this.add(name, SymbolKind.Variable, type);
  }

  public typeVariable(name: string, type: Type): Suggestions {
    return this.add(name, SymbolKind.ObjectVariable, type);
  }

  public removeKeyword(name: string): Suggestions {
    return this.remove(name, SymbolKind.Keyword);
  }

  private add(name: string, kind: SymbolKind, type: Type | null = null): Suggestions {
    this.values.push(new AddSuggestion(this.scope, name, kind, type));
    return this;
  }

  private remove(name: string, kind: SymbolKind): Suggestions {
    this.values.push(new RemoveSuggestion(name, kind));
    return this;
  }
}
