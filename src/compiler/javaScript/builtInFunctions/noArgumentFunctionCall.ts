import {CodeWriter} from "../writers/codeWriter";
import {FunctionCall} from "./functionCall";
import {FunctionCallExpression} from "../../../language/expressions/functions/functionCallExpression";

export abstract class NoArgumentFunctionCall<TFunctionExpression extends FunctionCallExpression>
  extends FunctionCall<TFunctionExpression> {

   protected abstract className: string;
   protected abstract methodName: string

   public override renderExpression(expresion: TFunctionExpression , codeWriter: CodeWriter){
     codeWriter.writeEnvironment();
     codeWriter.write(`.${this.className}.${this.methodName}()`);
   }
}
