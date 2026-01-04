import {CodeWriter} from "../codeWriter";
import {functionClassName} from "../classNames";
import {LexyCodeConstants} from "../lexyCodeConstants";
import {Expression} from "../../../language/expressions/expression";
import {
  instanceOfLexyFunctionCallExpression,
  LexyFunctionCallExpression
} from "../../../language/expressions/functions/lexyFunctionCallExpression";

//Syntax: "LexyFunction(variable)"
export class LexyFunctionCall {

  public static matches(expression: Expression) {
    return instanceOfLexyFunctionCallExpression(expression);
  }

  public static render(expression: LexyFunctionCallExpression, codeWriter: CodeWriter) {
    return LexyFunctionCall.renderFunction(
      expression.functionName,
      expression.parameterName,
      codeWriter);
  }

  public static renderFunction(functionName: string, variableName: string | null, codeWriter: CodeWriter) {
    codeWriter.writeEnvironment("." + functionClassName(functionName));
    codeWriter.write(`(${variableName}, ${LexyCodeConstants.contextVariable})`);
  }
}
