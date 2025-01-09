import {ILineExpressionException} from "./ILineExpressionException";
import {Expression} from "../../../language/expressions/expression";
import {asFunctionCallExpression} from "../../../language/expressions/functionCallExpression";
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

    return instanceOfNewFunction(functionCallExpression.expressionFunction);
  }


   public render(expression: Expression, codeWriter: CodeWriter) {
     const assignmentExpression = asVariableDeclarationExpression(expression);
     if (assignmentExpression == null) throw new Error(`expression should be VariableDeclarationExpression`);

     const functionCallExpression = asFunctionCallExpression(assignmentExpression.assignment);
     if (functionCallExpression == null) throw new Error(`assignmentExpression.assignment should be FunctionCallExpression`);

     const newFunction = asNewFunction(functionCallExpression.expressionFunction)
     if (functionCallExpression == null) throw new Error(`functionCallExpression.ExpressionFunction should be NewFunction`);

     const type = translateType(assignmentExpression.type);
     codeWriter.writeLine("const " + assignmentExpression.name + " = new " + type + "();")
   }
}
