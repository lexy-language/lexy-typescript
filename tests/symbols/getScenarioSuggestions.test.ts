import {verifySuggestions} from "./verifySuggestions";

describe('GetScenarioSuggestionsTests', () => {

  it('scenarioKeyword', async () => {
    await verifySuggestions(async context => {
      await context.keyword(`scenario Name
  p`, 2, 3, "parameters");
      await context.keyword(`scenario Name
  res`, 2, 5, "results");
      await context.keyword(`scenario Name
  va`, 2, 4, "validationTable");
    });

    //todo add variables
  });
});
