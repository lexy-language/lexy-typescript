import {MethodFunctionCall} from "./methodFunctionCall";
import {PowerFunction} from "../../../language/expressions/functions/powerFunction";
import {CodeWriter} from "../writers/codeWriter";

export class PowerFunctionCall extends MethodFunctionCall<PowerFunction> {

  protected override className = "builtInNumberFunctions";
  protected override methodName = "power";

  protected override renderArguments(expression: PowerFunction, codeWriter: CodeWriter) {
    codeWriter.renderExpression(expression.numberExpression);
    codeWriter.write(", ");
    codeWriter.renderExpression(expression.powerExpression);
  }
}
