import {Suggestion} from "../../language/symbols/suggestion";

export class SuggestionsResult {

  public filtered: readonly Suggestion[] = [];
  public all: readonly Suggestion[] = [];

  constructor(filtered: readonly Suggestion[] | null = null, all: readonly Suggestion[] | null = null) {
    this.filtered = filtered ? filtered : [];
    this.all = all ? all : [];
  }
}
