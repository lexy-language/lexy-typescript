import {Suggestion} from "../../language/symbols/suggestion";

export class SuggestionsResult {

  public filtered: readonly Suggestion[] = [];
  public all: readonly Suggestion[] = [];
  public filter: string | null;

  constructor(filtered: readonly Suggestion[] | null = null, all: readonly Suggestion[] | null = null, filter: string | null = null) {
    this.filtered = filtered ? filtered : [];
    this.all = all ? all : [];
    this.filter = filter;
  }
}
