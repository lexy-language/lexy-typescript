import {Expression} from "../../../src/language/expressions/expression";
import {ExpressionFactory} from "../../../src/language/expressions/expressionFactory";
import {Line} from "../../../src/parser/line";
import {Tokenizer} from "../../../src/parser/tokens/tokenizer";
import {expectSuccess} from "../../expectSuccess";
import {TestFile} from "../../testFile";
import {initializeExpressionFactory} from "../../../src/language/expressions/initializeExpressionFactory";

export function parseExpression(expression: string): Expression {

  initializeExpressionFactory();

  const tokenizer = new Tokenizer();
  const line = new Line(0, expression, TestFile.instance);

  const tokens = line.tokenize(tokenizer);
  if (tokens.state == 'failed') {
    throw new Error(`Tokenizing failed: ${tokens.errorMessage}`);
  }

  const result = ExpressionFactory.parse(null, line.tokens, line);
  return expectSuccess(result);
}

export function parseExpressionExpectException(expression: string, errorMessage: string) {

  initializeExpressionFactory();

  const tokenizer = new Tokenizer();
  const line = new Line(0, expression, TestFile.instance);

  let tokens = line.tokenize(tokenizer);
  if (tokens.state == 'failed') {
    throw new Error(`Tokenizing failed: ${tokens.errorMessage}`);
  }

  const result = ExpressionFactory.parse(null, line.tokens, line);
  if (result.state != "failed") {
    throw new Error("result.state should be failed but is success")
  }
  expect(result.errorMessage).toBe(errorMessage);
}
