import {Expression} from "../../../language/expressions/expression";
import {
  asFunctionCallExpression
} from "../../../language/expressions/functions/functionCallExpression";
import {CodeWriter} from "../codeWriter";
import {Mapping} from "../../../language/expressions/functions/mapping";
import {VariableSource} from "../../../language/variableSource";
import {LexyCodeConstants} from "../lexyCodeConstants";
import {
  asExtractResultsFunctionExpression, ExtractResultsFunctionExpression,
  instanceOfExtractResultsFunctionExpression
} from "../../../language/expressions/functions/systemFunctions/extractResultsFunctionExpression";

//Syntax: "extract(params)"
export class ExtractFunctionStatement {

  public static matches(expression: Expression): boolean {
    const functionCallExpression = asFunctionCallExpression(expression);
    if (functionCallExpression == null) return false;

    return instanceOfExtractResultsFunctionExpression(functionCallExpression);
   }

   public static render(functionCallExpression: ExtractResultsFunctionExpression, codeWriter: CodeWriter) {
     const extractResultsFunction = asExtractResultsFunctionExpression(functionCallExpression);
     if (extractResultsFunction == null) throw new Error("Expression not ExtractResultsFunctionExpression: " + functionCallExpression)
     if (extractResultsFunction.functionResultVariable == null) throw new Error("extractResultsFunction.functionResultVariable is null");

     return ExtractFunctionStatement.renderExtract(extractResultsFunction.mapping, extractResultsFunction.functionResultVariable, codeWriter);
   }

   public static renderExtract(mappings: ReadonlyArray<Mapping>, functionResultVariable: string, codeWriter: CodeWriter) {
     for (const mapping of mappings) {
       this.renderMapping(functionResultVariable, mapping, codeWriter);
     }
   }

   private static renderMapping(functionResultVariable: string, mapping: Mapping, codeWriter: CodeWriter) {

     if (mapping.variableSource == VariableSource.Code) {
       codeWriter.startLine(mapping.variableName);
     } else  if (mapping.variableSource == VariableSource.Results) {
       codeWriter.startLine(`${LexyCodeConstants.resultsVariable}.${mapping.variableName}`);
     } else  if (mapping.variableSource == VariableSource.Parameters) {
       codeWriter.startLine(`${LexyCodeConstants.parameterVariable}.${mapping.variableName}`);
     } else {
       throw new Error(`Invalid source: ${mapping.variableSource}`)
     }

     codeWriter.write(" = ");
     codeWriter.endLine(`${functionResultVariable}.${mapping.variableName};`);
   }
}
