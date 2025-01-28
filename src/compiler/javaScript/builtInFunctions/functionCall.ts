import {FunctionCallExpression} from "../../../language/expressions/functions/functionCallExpression";
import {CodeWriter} from "../writers/codeWriter";

export abstract class FunctionCall<TFunctionExpression extends FunctionCallExpression> {
  public abstract renderExpression(expression: TFunctionExpression, codeWriter: CodeWriter): void;
}