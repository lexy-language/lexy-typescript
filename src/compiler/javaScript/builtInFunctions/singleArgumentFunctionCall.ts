import {MethodFunctionCall} from "./methodFunctionCall";
import {SingleArgumentFunction} from "../../../language/expressions/functions/singleArgumentFunction";
import {CodeWriter} from "../writers/codeWriter";
import {renderExpression} from "../renderers/renderExpression";

export abstract class SingleArgumentFunctionCall<TFunctionExpression extends SingleArgumentFunction>

  extends MethodFunctionCall<TFunctionExpression> {

  protected override renderArguments(expression: TFunctionExpression, codeWriter: CodeWriter) {
    renderExpression(expression.valueExpression, codeWriter);
  }
}
