import {FunctionCall} from "./functionCall";
import {FunctionCallExpression} from "../../../language/expressions/functions/functionCallExpression";
import {CodeWriter} from "../writers/codeWriter";

export abstract class MethodFunctionCall<TFunctionExpression extends FunctionCallExpression>
  extends FunctionCall<TFunctionExpression> {

  protected abstract className: string
  protected abstract methodName: string

  public override renderExpression(expression: TFunctionExpression, codeWriter: CodeWriter): void {
    codeWriter.writeEnvironment();
    codeWriter.write("." + this.className + "." + this.methodName + "(");
    this.renderArguments(expression, codeWriter);
    codeWriter.write(")");
  }

  protected abstract renderArguments(expression: TFunctionExpression, codeWriter: CodeWriter): void ;
}
