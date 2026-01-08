import {validateOfType} from "../../validateOfType";
import {parseExpression} from "./parseExpression";
import {
  asSpreadAssignmentExpression,
  SpreadAssignmentExpression
} from "../../../src/language/expressions/spreadAssignmentExpression";
import {
  asLexyFunctionCallExpression,
  LexyFunctionCallExpression
} from "../../../src/language/expressions/functions/lexyFunctionCallExpression";
import {instanceOfSpreadExpression} from "../../../src/language/expressions/spreadExpression";

describe('SpreadAssignmentExpressionTests', () => {

  it('functionCall', async () => {

    const expression = parseExpression(`... = Function1()`);
    validateOfType<SpreadAssignmentExpression>(asSpreadAssignmentExpression, expression, assignmentExpression =>
      validateOfType<LexyFunctionCallExpression>(asLexyFunctionCallExpression, assignmentExpression.assignment, functionCall =>
        expect(functionCall.functionName).toBe("Function1")));
  });

  it('functionCallWithSpreadExpression', async () => {

    const expression = parseExpression(`... = Function1(...)`);
    validateOfType<SpreadAssignmentExpression>(asSpreadAssignmentExpression, expression, assignmentExpression =>
      validateOfType<LexyFunctionCallExpression>(asLexyFunctionCallExpression, assignmentExpression.assignment, functionCall => {
        expect(functionCall.functionName).toBe("Function1");
        expect(functionCall.args.length).toBe(1);
        expect(instanceOfSpreadExpression(functionCall.args[0])).toBeTruthy();
      }));
  });
});