import {FunctionCall} from "./functionCall";
import {LexyFunction} from "../../../language/expressions/functions/lexyFunction";
import {CodeWriter} from "../writers/codeWriter";
import {functionClassName} from "../classNames";
import {LexyCodeConstants} from "../../lexyCodeConstants";

export class LexyFunctionCall extends FunctionCall<LexyFunction> {

  public renderExpression(expression: LexyFunction, codeWriter: CodeWriter) {
    return LexyFunctionCall.renderFunction(
      expression.functionName,
      expression.variableName,
      codeWriter);
  }

  public static renderFunction(functionName: string, variableName: string | null, codeWriter: CodeWriter) {
    codeWriter.writeNamespace("." + functionClassName(functionName));
    codeWriter.write(`(${variableName}, ${LexyCodeConstants.contextVariable})`);
  }
}
