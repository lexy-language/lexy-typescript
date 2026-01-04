import {CodeWriter} from "../codeWriter";
import {functionClassName} from "../classNames";
import {LexyCodeConstants} from "../lexyCodeConstants";
import {Expression} from "../../../language/expressions/expression";
import {
  instanceOfMemberFunctionCallExpression,
  MemberFunctionCallExpression
} from "../../../language/expressions/functions/memberFunctionCallExpression";
import {asLibraryFunctionCall, instanceOfLibraryFunctionCall} from "../../../functionLibraries/libraryFunctionCall";
import {Assert} from "../../../infrastructure/assert";

//Syntax: "LexyFunction(variable)"
export class LibraryFunctionCall {

  public static matches(expression: Expression) {
    return instanceOfMemberFunctionCallExpression(expression)
        && instanceOfLibraryFunctionCall(expression.functionCall);
  }

  public static render(expression: MemberFunctionCallExpression, codeWriter: CodeWriter) {

    const functionCall = Assert.notNull(asLibraryFunctionCall(expression.functionCall), "functionCall as LibraryFunctionCall")
    return LibraryFunctionCall.renderFunctionCall(
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