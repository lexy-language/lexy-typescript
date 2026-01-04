import {parseExpression, parseExpressionExpectException} from "./parseExpression";
import {validateOfType} from "../../validateOfType";
import {
  asFunctionCallExpression,
  FunctionCallExpression
} from "../../../src/language/expressions/functions/functionCallExpression";
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
import {
  asExtractResultsFunctionExpression,
  ExtractResultsFunctionExpression
} from "../../../src/language/expressions/functions/systemFunctions/extractResultsFunctionExpression";
import {
  asLexyFunctionCallExpression,
  LexyFunctionCallExpression
} from "../../../src/language/expressions/functions/lexyFunctionCallExpression";
import {
  asMemberFunctionCallExpression,
  MemberFunctionCallExpression
} from "../../../src/language/expressions/functions/memberFunctionCallExpression";
import {
  asFillParametersFunctionExpression,
  FillParametersFunctionExpression
} from "../../../src/language/expressions/functions/systemFunctions/fillParametersFunctionExpression";
import {
  asNewFunctionExpression,
  NewFunctionExpression
} from "../../../src/language/expressions/functions/systemFunctions/newFunctionExpression";

describe('FunctionCallExpressionTests', () => {
  it('functionCallExpression', async () => {
    let expression = parseExpression(`int(y)`);
    validateOfType<LexyFunctionCallExpression>(asLexyFunctionCallExpression, expression, functionCallExpression => {
      expect(functionCallExpression.functionName).toBe(`int`);
      expect(functionCallExpression.args.length).toBe(1);
      validateVariableExpression(functionCallExpression.args[0], `y`);
    });
  });

  it('nestedParenthesizedExpression', async () => {
    let expression = parseExpression(`int(5 * (3 + A))`);
    validateOfType<LexyFunctionCallExpression>(asLexyFunctionCallExpression, expression, functionCall => {
      expect(functionCall.functionName).toBe(`int`);
      expect(functionCall.args.length).toBe(1);
      validateOfType<BinaryExpression>(asBinaryExpression, functionCall.args[0], multiplication =>
        validateOfType<ParenthesizedExpression>(asParenthesizedExpression, multiplication.right, inner =>
          validateOfType<BinaryExpression>(asBinaryExpression, inner.expression, addition =>
            expect(addition.operator).toBe(ExpressionOperator.Addition))));
    });
  });

  it('nestedParenthesizedMultipleArguments', async () => {
    let expression = parseExpression(`round(power(98.6,3.2),3)`);
    validateOfType<LexyFunctionCallExpression>(asLexyFunctionCallExpression, expression, round => {
      expect(round.functionName).toBe(`round`);
      expect(round.args.length).toBe(2);
      validateOfType<LexyFunctionCallExpression>(asLexyFunctionCallExpression, round.args[0], power => {
        validateNumericLiteralExpression(power.args[0], 98.6);
        validateNumericLiteralExpression(power.args[1], 3.2);
      });
      validateNumericLiteralExpression(round.args[1], 3);
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

  it('libraryFunctionCallExpression', async () => {
    let expression = parseExpression(`Number.Parse(y)`);
    validateOfType<MemberFunctionCallExpression>(asMemberFunctionCallExpression, expression, functionCallExpression => {
      expect(functionCallExpression.functionPath.fullPath()).toBe(`Number.Parse`);
      expect(functionCallExpression.args.length).toBe(1);
      validateVariableExpression(functionCallExpression.args[0], `y`);
    });
  });

  it('libraryFunctionCallNestedParenthesizedExpression', async () => {
    let expression = parseExpression(`Number.Parse(5 * (3 + A))`);
    validateOfType<MemberFunctionCallExpression>(asMemberFunctionCallExpression, expression, functionCall => {
      expect(functionCall.functionPath.fullPath()).toBe(`Number.Parse`);
      expect(functionCall.args.length).toBe(1);
      validateOfType<BinaryExpression>(asBinaryExpression, functionCall.args[0], multiplication =>
        validateOfType<ParenthesizedExpression>(asParenthesizedExpression, multiplication.right, inner =>
          validateOfType<BinaryExpression>(asBinaryExpression, inner.expression, addition =>
            expect(addition.operator).toBe(ExpressionOperator.Addition))));
    });
  });

  it('libraryFunctionCallNestedParenthesizedExpression', async () => {
    let expression = parseExpression(`Number.Round(Math.Power(98.6,3.2),3)`);
    validateOfType<MemberFunctionCallExpression>(asMemberFunctionCallExpression, expression, functionCall => {
      expect(functionCall.functionPath.fullPath()).toBe(`Number.Round`);
      expect(functionCall.args.length).toBe(2);
      validateOfType<MemberFunctionCallExpression>(asMemberFunctionCallExpression, functionCall.args[0], power => {
        expect(power.functionPath.fullPath()).toBe(`Math.Power`);
        expect(power.args.length).toBe(2);
        validateNumericLiteralExpression(power.args[0], 98.6);
        validateNumericLiteralExpression(power.args[1], 3.2);
      });
      validateNumericLiteralExpression(functionCall.args[1], 3);
    });
  });

  it('libraryFunctionCallInvalidNestedParenthesizedExpression', async () => {
    parseExpressionExpectException(
      `Math.Func(A`,
      `(FunctionCallExpression) No closing parentheses found.`);
  });

  it('callExtract', async () => {
    let expression = parseExpression(`extract(result)`);
    validateOfType<ExtractResultsFunctionExpression>(asExtractResultsFunctionExpression, expression, extract => {
      validateIdentifierExpression(extract.valueExpression, `result`);
    });
  });

  it('callFill', async () => {
    let expression = parseExpression(`fill(result)`);
    validateOfType<FillParametersFunctionExpression>(asFillParametersFunctionExpression, expression, fill => {
      validateIdentifierExpression(fill.valueExpression, `result`);
    });
  });

  it('callNew', async () => {
    let expression = parseExpression(`new(result)`);
    validateOfType<NewFunctionExpression>(asNewFunctionExpression, expression, newFunction => {
      validateIdentifierExpression(newFunction.valueExpression, `result`);
    });
  });
});
