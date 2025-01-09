import {CodeWriter} from "../writers/codeWriter";
import {FunctionCall} from "./functionCall";
import {ExpressionFunction} from "../../../language/expressions/functions/expressionFunction";

export abstract class NoArgumentFunctionCall<TFunctionExpression extends ExpressionFunction>
  extends FunctionCall<TFunctionExpression> {

   protected abstract className: string;
   protected abstract methodName: string

   public override renderExpression(expresion: TFunctionExpression , codeWriter: CodeWriter){
     codeWriter.writeNamespace();
     codeWriter.write(`.${this.className}.${this.methodName}()`);
   }
}
