import {MethodFunctionCall} from "./methodFunctionCall";
import {RoundFunction} from "../../../language/expressions/functions/roundFunction";
import {CodeWriter} from "../writers/codeWriter";

export class RoundFunctionCall extends MethodFunctionCall<RoundFunction> {

  protected override className = "builtInNumberFunctions";
  protected override methodName = "round";

  protected override renderArguments(expression: RoundFunction, codeWriter: CodeWriter) {
    codeWriter.renderExpression(expression.numberExpression);
    codeWriter.write(", ");
    codeWriter.renderExpression(expression.digitsExpression);
  }
}
