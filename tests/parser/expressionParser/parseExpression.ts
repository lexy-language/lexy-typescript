import {Expression} from "../../../src/language/expressions/expression";
import {ExpressionFactory} from "../../../src/language/expressions/expressionFactory";
import {Line} from "../../../src/parser/line";
import {Tokenizer} from "../../../src/parser/tokens/tokenizer";
import {expectSuccess} from "../../expectSuccess";

export function parseExpression(expression: string): Expression {

  const expressionFactory = new ExpressionFactory();
  const tokenizer = new Tokenizer();
  const line = new Line(0, expression, `tests.lexy`);

  const tokens = line.tokenize(tokenizer);
  if (tokens.state == 'failed') {
    throw new Error(`Tokenizing failed: ${tokens.errorMessage}`);
  }

  const result = expressionFactory.parse(null, line.tokens, line);
  return expectSuccess(result);
}

export function parseExpressionExpectException(expression: string, errorMessage: string) {

  const expressionFactory = new ExpressionFactory();
  const tokenizer = new Tokenizer();
  const line = new Line(0, expression, `tests.lexy`);

  let tokens = line.tokenize(tokenizer);
  if (tokens.state == 'failed') {
    throw new Error(`Tokenizing failed: ${tokens.errorMessage}`);
  }

  const result = expressionFactory.parse(null, line.tokens, line);
  if (result.state != "failed") {
    throw new Error("result.state should be failed but is success")
  }
  expect(result.errorMessage).toBe(errorMessage);
}
