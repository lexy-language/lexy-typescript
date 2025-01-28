import {MethodFunctionCall} from "./methodFunctionCall";
import {SingleArgumentFunction} from "../../../language/expressions/functions/singleArgumentFunction";
import {CodeWriter} from "../writers/codeWriter";

export abstract class SingleArgumentFunctionCall<TFunctionExpression extends SingleArgumentFunction>

  extends MethodFunctionCall<TFunctionExpression> {

  protected override renderArguments(expression: TFunctionExpression, codeWriter: CodeWriter) {
    codeWriter.renderExpression(expression.valueExpression);
  }
}
