import type {ILineExpressionException} from "./ILineExpressionException";

import {Expression} from "../../../language/expressions/expression";
import {asFunctionCallExpression} from "../../../language/expressions/functions/functionCallExpression";
import {
  asLexyFunction,
  instanceOfLexyFunction,
  LexyFunction
} from "../../../language/expressions/functions/lexyFunction";
import {CodeWriter} from "../writers/codeWriter";
import {LexyCodeConstants} from "../lexyCodeConstants";
import {FillFunctionExpressionStatementException} from "./fillFunctionExpressionStatementException";
import {ExtractFunctionExpressionStatementException} from "./extractFunctionExpressionStatementException";
import {LexyFunctionCall} from "../builtInFunctions/lexyFunctionCall";

export class SimpleLexyFunctionFunctionExpressionStatementException implements ILineExpressionException {

  public matches(expression: Expression): boolean {
    const functionCallExpression = asFunctionCallExpression(expression);
    if (functionCallExpression == null) return false;

    const instanceOfLexyFunction1 = instanceOfLexyFunction(functionCallExpression);
    return instanceOfLexyFunction1;
  }

  public render(expression: Expression, codeWriter: CodeWriter) {
    const functionCallExpression = asFunctionCallExpression(expression);
    if (functionCallExpression == null) throw new Error(`expression should be FunctionCallExpression`);

    const lexyFunction = asLexyFunction(functionCallExpression);
    if (lexyFunction == null) throw new Error(`functionCallExpression.FunctionCallExpression should be ExtractResultsFunction`);

    let parameterVariable = `${LexyCodeConstants.parameterVariable}_${codeWriter.currentLine}`;
    let resultsVariable = `${LexyCodeConstants.resultsVariable}_${codeWriter.currentLine}`;

    FillFunctionExpressionStatementException.renderFill(
      parameterVariable,
      lexyFunction.functionParametersType,
      lexyFunction.mappingParameters,
      codeWriter);

    this.renderRunFunction(lexyFunction, parameterVariable, resultsVariable, codeWriter);

    ExtractFunctionExpressionStatementException.renderExtract(
      lexyFunction.mappingResults,
      resultsVariable,
      codeWriter);
  }

  private renderRunFunction(lexyFunction: LexyFunction,
                            parameterVariable: string,
                            resultsVariable: string,
                            codeWriter: CodeWriter) {
    codeWriter.startLine(`let ${resultsVariable} = `);
    LexyFunctionCall.renderFunction(lexyFunction.functionName, parameterVariable, codeWriter);
    codeWriter.endLine(";");
  }
}
