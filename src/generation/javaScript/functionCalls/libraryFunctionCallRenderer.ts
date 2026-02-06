import {CodeWriter} from "../codeWriter";
import {LexyCodeConstants} from "../lexyCodeConstants";
import {Expression} from "../../../language/expressions/expression";
import {
  instanceOfMemberFunctionCallExpression,
  MemberFunctionCallExpression
} from "../../../language/expressions/functions/memberFunctionCallExpression";
import {Assert} from "../../../infrastructure/assert";
import {
  asLibraryFunctionCallState,
  instanceOfLibraryFunctionCallState
} from "../../../functionLibraries/libraryFunctionCallState";

//Syntax: "LexyFunction(variable)"
export class LibraryFunctionCallRenderer {

  public static matches(expression: Expression) {
    return instanceOfMemberFunctionCallExpression(expression)
        && instanceOfLibraryFunctionCallState(expression.state);
  }

  public static render(expression: MemberFunctionCallExpression, codeWriter: CodeWriter) {

    const functionCall = Assert.notNull(asLibraryFunctionCallState(expression.state), "functionCallState as LibraryFunctionCall")
    return LibraryFunctionCallRenderer.renderFunctionCall(
      functionCall.libraryName,
      functionCall.functionName,
      expression.args,
      codeWriter);
  }

  private static renderFunctionCall(libraryName: string, functionName: string, argumentExpressions: ReadonlyArray<Expression>, codeWriter: CodeWriter) {
    codeWriter.writeEnvironment(`.libraries.${libraryName}.functions.${functionName}`);
    codeWriter.write("(");
    for (const argumentExpressionKey in argumentExpressions) {
      const argumentExpression = argumentExpressions[argumentExpressionKey];
      codeWriter.renderExpression(argumentExpression);
      codeWriter.write(", ");
    }
    codeWriter.write(`${LexyCodeConstants.contextVariable})`);
  }
}
