import {verifySuggestions} from "./verifySuggestions";

describe('GetRootLevelSuggestionsTests', () => {

  it('scenarioKeyword', async () => {
    await verifySuggestions(async context => {
      await context.keyword("s", 1, 2, "scenario");
      await context.keyword("scen", 1, 2, "scenario");
      await context.keyword("scen", 1, 4, "scenario");
    });
  });

  it('enumKeyword', async () => {
    await verifySuggestions(async context => {
      await context.keyword("e", 1, 2, "enum");
      await context.keyword("enu", 1, 2, "enum");
      await context.keyword("enu", 1, 3, "enum");
    });
  });

  it('typeKeyword', async () => {
    await verifySuggestions(async context => {
      await context.suggestion("t", 1, 2, suggestions => suggestions
        .keyword("type")
        .keyword("table")
      );
      await context.keyword("ty", 1, 3, "type");
      await context.keyword("typ", 1, 4, "type");
    });
  });

  it('tableKeyword', async () => {
    await verifySuggestions(async context => {
      await context.suggestion("t", 1, 2, suggestions => suggestions
        .keyword("table")
        .keyword("type")
      );
      await context.keyword("tab", 1, 4, "table");
      await context.keyword("tabl", 1, 5, "table");
    });
  });

  it('FunctionKeyword', async () => {
    await verifySuggestions(async context => {
      await context.keyword("f", 1, 2, "function");
      await context.keyword("fun", 1, 4, "function");
      await context.keyword("functi", 1, 7, "function");
    });
  });

  it('includeKeyword', async () => {
    await verifySuggestions(async context => {
      await context.keyword("i", 1, 2, "include");
      await context.keyword("inc", 1, 4, "include");
      await context.keyword("inclu", 1, 6, "include");
    });
  });
});
