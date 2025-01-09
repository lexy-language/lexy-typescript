import {ExpressionFunction} from "../../../language/expressions/functions/expressionFunction";
import {CodeWriter} from "../writers/codeWriter";

export abstract class FunctionCall<TFunctionExpression extends ExpressionFunction> {

  public renderCustomFunction(expression: TFunctionExpression, codeWriter: CodeWriter) {
  }

  public abstract renderExpression(expression: TFunctionExpression, codeWriter: CodeWriter);
}



