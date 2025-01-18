import {EndStartDateFunction} from "../../../language/expressions/functions/endStartDateFunction";
import {MethodFunctionCall} from "./methodFunctionCall";
import {CodeWriter} from "../writers/codeWriter";
import {renderExpression} from "../renderers/renderExpression";

export abstract class EndStartDateFunctionCall<TFunctionExpression extends EndStartDateFunction>
  extends MethodFunctionCall<TFunctionExpression> {

  protected override renderArguments(expression: TFunctionExpression, codeWriter: CodeWriter) {
    renderExpression(expression.endDateExpression, codeWriter);
    codeWriter.write(", ")
    renderExpression(expression.startDateExpression, codeWriter);
  }
}
