import {parseExpression, parseExpressionExpectException} from "./parseExpression";
import {validateOfType} from "../../validateOfType";
import {
  asFunctionCallExpression,
  FunctionCallExpression
} from "../../../src/language/expressions/functions/functionCallExpression";
import {asIntFunction, IntFunction} from "../../../src/language/expressions/functions/intFunction";
import {
  validateIdentifierExpression,
  validateNumericLiteralExpression,
  validateVariableExpression
} from "./expressionTestExtensions";
import {asBinaryExpression, BinaryExpression} from "../../../src/language/expressions/binaryExpression";
import {
  asParenthesizedExpression,
  ParenthesizedExpression
} from "../../../src/language/expressions/parenthesizedExpression";
import {ExpressionOperator} from "../../../src/language/expressions/expressionOperator";
import {asRoundFunction, RoundFunction} from "../../../src/language/expressions/functions/roundFunction";
import {asPowerFunction, PowerFunction} from "../../../src/language/expressions/functions/powerFunction";
import {
  asExtractResultsFunction,
  ExtractResultsFunction
} from "../../../src/language/expressions/functions/extractResultsFunction";

describe('FunctionCallExpressionTests', () => {
  it('functionCallExpression', async () => {
    let expression = parseExpression(`INT(y)`);
    validateOfType<FunctionCallExpression>(asFunctionCallExpression, expression, functionCallExpression => {
      expect(functionCallExpression.functionName).toBe(`INT`);
      validateOfType<IntFunction>(asIntFunction, functionCallExpression, functionExpression =>
        validateVariableExpression(functionExpression.valueExpression, `y`));
    });
  });

  it('nestedParenthesizedExpression', async () => {
    let expression = parseExpression(`INT(5 * (3 + A))`);
    validateOfType<FunctionCallExpression>(asFunctionCallExpression, expression, functionCall => {
      expect(functionCall.functionName).toBe(`INT`);
      validateOfType<IntFunction>(asIntFunction, functionCall, functionExpression =>
        validateOfType<BinaryExpression>(asBinaryExpression, functionExpression.valueExpression, multiplication =>
          validateOfType<ParenthesizedExpression>(asParenthesizedExpression, multiplication.right, inner =>
            validateOfType<BinaryExpression>(asBinaryExpression, inner.expression, addition =>
              expect(addition.operator).toBe(ExpressionOperator.Addition)))));
    });
  });

  it('nestedParenthesizedMultipleArguments', async () => {
    let expression = parseExpression(`ROUND(POWER(98.6,3.2),3)`);
    validateOfType<RoundFunction>(asRoundFunction, expression, round => {
      expect(round.functionName).toBe(`ROUND`);
      validateOfType<PowerFunction>(asPowerFunction, round.numberExpression, power => {
        validateNumericLiteralExpression(power.numberExpression, 98.6);
        validateNumericLiteralExpression(power.powerExpression, 3.2);
      });
      validateNumericLiteralExpression(round.digitsExpression, 3);
    });
  });

  it('callExtract', async () => {
    let expression = parseExpression(`extract(result)`);
    validateOfType<ExtractResultsFunction>(asExtractResultsFunction, expression, round => {
      expect(round.functionName).toBe(`extract`);
      validateIdentifierExpression(round.valueExpression, `result`);
    });
  });

  it('invalidParenthesizedExpression', async () => {
    parseExpressionExpectException(
      `func(A`,
      `(FunctionCallExpression) No closing parentheses found.`);
  });

  it('invalidNestedParenthesizedExpression', async () => {
    parseExpressionExpectException(
      `func(5 * (3 + A)`,
      `(FunctionCallExpression) No closing parentheses found.`);
  });
});
