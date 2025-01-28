import type {ILineExpressionException} from "./ILineExpressionException";

import {Expression} from "../../../language/expressions/expression";
import {asFunctionCallExpression} from "../../../language/expressions/functions/functionCallExpression";
import {asVariableDeclarationExpression} from "../../../language/expressions/variableDeclarationExpression";
import {asNewFunction, instanceOfNewFunction} from "../../../language/expressions/functions/newFunction";
import {CodeWriter} from "../writers/codeWriter";
import {translateType} from "../types";

export class NewFunctionExpressionStatementException implements ILineExpressionException {

  public matches(expression: Expression): boolean {
    const assignmentExpression = asVariableDeclarationExpression(expression);
    if (assignmentExpression == null) return false;

    const functionCallExpression = asFunctionCallExpression(assignmentExpression.assignment);
    if (functionCallExpression == null) return false;

    return instanceOfNewFunction(functionCallExpression);
  }


  public render(expression: Expression, codeWriter: CodeWriter) {
    const assignmentExpression = asVariableDeclarationExpression(expression);
    if (assignmentExpression == null) throw new Error(`expression should be VariableDeclarationExpression`);
    if (assignmentExpression.type.variableType == null) throw new Error(`assignmentExpression.type.variableType should not be null`);

    const functionCallExpression = asFunctionCallExpression(assignmentExpression.assignment);
    if (functionCallExpression == null) throw new Error(`assignmentExpression.assignment should be FunctionCallExpression`);

    const newFunction = asNewFunction(functionCallExpression)
    if (newFunction == null) throw new Error(`functionCallExpression.FunctionCallExpression should be NewFunction`);

    const type = translateType(assignmentExpression.type.variableType);
    codeWriter.write("const " + assignmentExpression.name + " = new ");
    codeWriter.writeEnvironment(`.${translateType(assignmentExpression.type.variableType)}`)
    codeWriter.endLine("();")
  }
}
