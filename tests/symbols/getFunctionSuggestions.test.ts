import {verifySuggestions} from "./verifySuggestions";

describe('GetFunctionSuggestionsTests', () => {

  it('keywords', async () => {

    const code: string = "function Name\n  ";

    await verifySuggestions(async context => {
      await context.suggestion(code, 2, 3, verify => verify
        .notKeyword("function")
        .notKeyword("enum")
        .notKeyword("type")
        .notKeyword("table")
        .notKeyword("scenario")
        .notKeyword("include")
      );
      await context.suggestion(code + "p", 2, 4, verify => verify
        .keyword("parameters")
      );
      await context.suggestion(code + "res", 2, 5, verify => verify
        .keyword("results")
      );
      await context.suggestion(code + "i", 2, 4, verify => verify
        .keyword("if")
        .notKeyword("elseif")
        .notKeyword("else")
      );
      await context.suggestion(code + "if true\n  e", 3, 3, verify => verify
        .notKeyword("if")
        .keyword("elseif")
        .keyword("else")
      );
      await context.suggestion(code + "if true\n  let a = 6\n  e", 4, 3, verify => verify
        .notKeyword("if")
        .keyword("elseif")
        .keyword("else")
      );
      await context.suggestion(code + "s", 2, 4, verify => verify
        .keyword("switch")
        .notKeyword("case")
        .notKeyword("default")
      );
      await context.suggestion(code + "switch 5\n    c", 3, 6, verify => verify
        .notKeyword("switch")
        .keyword("case")
        .notKeyword("default")
      );
      await context.suggestion(code + "switch 5\n    d", 3, 6, verify => verify
        .notKeyword("switch")
        .notKeyword("case")
        .keyword("default")
      );
      }
    );
  });

  it('parameter', async () => {

    const code: string = `function Name
  parameters
    number Value1
  let value = Val`;

    await verifySuggestions(async context => {
      await context.suggestion(code, 4, 16, context => context
        .parameter("Value1")
      );
    });
  });

  it('result', async () => {

    const code: string = `function Name
  results
    number Result1
  Resu`;

    await verifySuggestions(async context => {
      await context.suggestion(code, 4, 7, context => context
        .result("Result1")
      );
    });
  });

  it('variable', async () => {
    const code: string = `function Name
  let value1 = 5
  val`;

    await verifySuggestions(async context => {
      await context.suggestion(code, 3, 5, context => context
        .variable("value1")
      );
    });
  });

  it('objectVariable', async () => {
    const code: string = `type Object
  number Value

function Name
  Object value1
  value1.Val`;

    await verifySuggestions(async context => {
      await context.suggestion(code, 6, 12, context => context
        .objectVariable("Value")
      );
    });
  });

  it('objectVariableNoHint', async () => {
    const code: string = `type Object
  number Value
  string Member

function Name
  Object value1
  value1.`;

    await verifySuggestions(async context => {
      await context.suggestion(code, 7, 9, context => context
        .objectVariable("Value")
        .objectVariable("Member")
      );
    });
  });
});
