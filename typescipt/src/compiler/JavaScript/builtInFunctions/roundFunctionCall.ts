import {MethodFunctionCall} from "./methodFunctionCall";
import {RoundFunction} from "../../../language/expressions/functions/roundFunction";
import {CodeWriter} from "../writers/codeWriter";
import {renderExpression} from "../renderers/renderExpression";

export class RoundFunctionCall extends MethodFunctionCall<RoundFunction> {

  protected override className = "builtInNumberFunctions";
  protected override methodName = "round";

  protected override renderArguments(expression: RoundFunction, codeWriter: CodeWriter) {
    renderExpression(expression.numberExpression, codeWriter);
    codeWriter.write(", ");
    renderExpression(expression.digitsExpression, codeWriter);
  }
}
