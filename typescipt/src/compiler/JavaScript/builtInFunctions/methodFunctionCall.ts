import {FunctionCall} from "./functionCall";
import {ExpressionFunction} from "../../../language/expressions/functions/expressionFunction";
import {CodeWriter} from "../writers/codeWriter";

export abstract class MethodFunctionCall<TFunctionExpression extends ExpressionFunction>
  extends FunctionCall<TFunctionExpression> {

  public abstract className: string
  public abstract methodName: string

  public override renderExpression(expression: TFunctionExpression, codeWriter: CodeWriter) {
    codeWriter.writeNamespace();
    codeWriter.write("." + this.className + "." + this.methodName + "(");
    this.renderArguments(expression, codeWriter);
    codeWriter.write(")");
  }

  protected abstract renderArguments(expression: TFunctionExpression, codeWriter: CodeWriter);
}
