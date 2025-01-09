import {ILineExpressionException} from "./ILineExpressionException";
import {Expression} from "../../../language/expressions/expression";
import {
  asFunctionCallExpression,
  instanceOfFunctionCallExpression
} from "../../../language/expressions/functionCallExpression";
import {CodeWriter} from "../writers/codeWriter";
import {Mapping} from "../../../language/expressions/functions/mapping";
import {VariableSource} from "../../../language/variableSource";
import {LexyCodeConstants} from "../../lexyCodeConstants";
import {
  asExtractResultsFunction,
  instanceOfExtractResultsFunction
} from "../../../language/expressions/functions/extractResultsFunction";

export class ExtractFunctionExpressionStatementException implements ILineExpressionException {

  public matches(expression: Expression): boolean {
    const functionCallExpression = asFunctionCallExpression(expression);
    if (functionCallExpression == null) return false;

    return instanceOfExtractResultsFunction(functionCallExpression.expressionFunction);
   }

   public render(expression: Expression, codeWriter: CodeWriter) {
     const functionCallExpression = asFunctionCallExpression(expression);
     if (functionCallExpression == null) throw new Error("Expression not FunctionCallExpression: " + expression.nodeType)

     const extractResultsFunction = asExtractResultsFunction(functionCallExpression.expressionFunction);
     if (extractResultsFunction == null) throw new Error("Expression not ExtractResultsFunction: " + functionCallExpression.expressionFunction)
     if (extractResultsFunction.functionResultVariable == null) throw new Error("extractResultsFunction.functionResultVariable is null");

     return ExtractFunctionExpressionStatementException.renderExtract(extractResultsFunction.mapping, extractResultsFunction.functionResultVariable, codeWriter);
   }

   public static renderExtract(mappings: ReadonlyArray<Mapping>, functionResultVariable: string, codeWriter: CodeWriter) {
     for (const mapping of mappings) {
       this.renderMapping(functionResultVariable, mapping, CodeWriter);
     }
   }

   private static renderMapping(functionResultVariable: string, mapping: Mapping, codeWriter: CodeWriter) {

     if (mapping.variableSource == VariableSource.Code) {
       codeWriter.write(mapping.variableName);
     } else  if (mapping.variableSource == VariableSource.Results) {
       codeWriter.write(`${LexyCodeConstants.resultsVariable}.${mapping.variableName}`);
     } else {
       throw new Error(`Invalid source: ${mapping.variableSource}`)
     }

     codeWriter.write(" = ");
     codeWriter.write(`${functionResultVariable}.${mapping.variableName}`);
   }
}
