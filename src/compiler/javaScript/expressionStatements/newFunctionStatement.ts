import {Expression} from "../../../language/expressions/expression";
import {asFunctionCallExpression} from "../../../language/expressions/functions/functionCallExpression";
import {
  asVariableDeclarationExpression,
  VariableDeclarationExpression
} from "../../../language/expressions/variableDeclarationExpression";
import {asNewFunctionExpression, instanceOfNewFunctionExpression} from "../../../language/expressions/functions/systemFunctions/newFunctionExpression";
import {CodeWriter} from "../codeWriter";
import {translateType} from "../types";

export class NewFunctionExpressionStatement {

  public static matches(expression: Expression): boolean {
    const assignmentExpression = asVariableDeclarationExpression(expression);
    if (assignmentExpression == null) return false;

    const functionCallExpression = asFunctionCallExpression(assignmentExpression.assignment);
    if (functionCallExpression == null) return false;

    return instanceOfNewFunctionExpression(functionCallExpression);
  }

  public static render(assignmentExpression: VariableDeclarationExpression, codeWriter: CodeWriter) {
    if (assignmentExpression.type.variableType == null) throw new Error(`assignmentExpression.type.variableType should not be null`);

    const functionCallExpression = asFunctionCallExpression(assignmentExpression.assignment);
    if (functionCallExpression == null) throw new Error(`assignmentExpression.assignment should be FunctionCallExpression`);

    const newFunctionExpression = asNewFunctionExpression(functionCallExpression)
    if (newFunctionExpression == null) throw new Error(`functionCallExpression.FunctionCallExpression should be NewFunctionExpression`);

    const type = translateType(assignmentExpression.type.variableType);
    codeWriter.write("const " + assignmentExpression.name + " = new ");
    codeWriter.writeEnvironment(`.${translateType(assignmentExpression.type.variableType)}`)
    codeWriter.endLine("();")
  }
}
