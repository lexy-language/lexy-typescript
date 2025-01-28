import {EndStartDateFunction} from "../../../language/expressions/functions/endStartDateFunction";
import {MethodFunctionCall} from "./methodFunctionCall";
import {CodeWriter} from "../writers/codeWriter";

export abstract class EndStartDateFunctionCall<TFunctionExpression extends EndStartDateFunction>
  extends MethodFunctionCall<TFunctionExpression> {

  protected override renderArguments(expression: TFunctionExpression, codeWriter: CodeWriter) {
    codeWriter.renderExpression(expression.endDateExpression);
    codeWriter.write(", ")
    codeWriter.renderExpression(expression.startDateExpression);
  }
}
