import {MethodFunctionCall} from "./methodFunctionCall";
import {PowerFunction} from "../../../language/expressions/functions/powerFunction";
import {CodeWriter} from "../writers/codeWriter";
import {renderExpression} from "../renderers/renderExpression";

export class PowerFunctionCall extends MethodFunctionCall<PowerFunction> {

  protected override className = "BuiltInNumberFunctions";
  protected override methodName = "power";

  protected override renderArguments(expression: PowerFunction, codeWriter: CodeWriter) {
    renderExpression(expression.numberExpression, codeWriter);
    codeWriter.write(", ");
    renderExpression(expression.powerExpression, codeWriter);
  }
}
