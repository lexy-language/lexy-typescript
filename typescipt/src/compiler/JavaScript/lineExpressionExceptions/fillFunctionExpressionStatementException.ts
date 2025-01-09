import {ILineExpressionException} from "./ILineExpressionException";
import {Expression} from "../../../language/expressions/expression";
import {asFunctionCallExpression} from "../../../language/expressions/functionCallExpression";
import {asVariableDeclarationExpression} from "../../../language/expressions/variableDeclarationExpression";
import {
  asFillParametersFunction,
  instanceOfFillParametersFunction
} from "../../../language/expressions/functions/fillParametersFunction";
import {VariableType} from "../../../language/variableTypes/variableType";
import {Mapping} from "../../../language/expressions/functions/mapping";
import {VariableSource} from "../../../language/variableSource";
import {LexyCodeConstants} from "../../lexyCodeConstants";
import {translateType} from "../types";
import {CodeWriter} from "../writers/codeWriter";

export class FillFunctionExpressionStatementException implements ILineExpressionException {

  public matches(expression: Expression): boolean {
    const assignmentExpression = asVariableDeclarationExpression(expression);
    if (assignmentExpression == null) return false;

    const functionCallExpression = asFunctionCallExpression(assignmentExpression.assignment);
    if (functionCallExpression == null) return false;

    return instanceOfFillParametersFunction(functionCallExpression.expressionFunction);
  }

   public render(expression: Expression, codeWriter: CodeWriter) {
     const assignmentExpression = asVariableDeclarationExpression(expression);
     if (assignmentExpression == null) throw new Error(`expression should be AssignmentExpression`);

     const functionCallExpression = asFunctionCallExpression(assignmentExpression.assignment);
     if (functionCallExpression == null) throw new Error(`assignmentExpression.assignment should be FunctionCallExpression`);

     const fillParametersFunction = asFillParametersFunction(functionCallExpression.expressionFunction);
     if (fillParametersFunction == null) throw new Error("Expression not FillParametersFunction: " + functionCallExpression.expressionFunction)

     return FillFunctionExpressionStatementException.renderFill(assignmentExpression.name, fillParametersFunction.type, fillParametersFunction.mapping, codeWriter);
   }

   public static renderFill(variableName: string, type: VariableType, mappings: ReadonlyArray<Mapping>, codeWriter: CodeWriter) {
     const typeName = translateType(type);
     codeWriter.writeLine(`const ${variableName}new ${typeName}();`);

     for (const mapping of mappings) {
       codeWriter.startLine(variableName + "." + mapping.variableName + " = " +  + ";");

       if (mapping.variableSource == VariableSource.Code) {
         codeWriter.write(mapping.variableName);
       } else  if (mapping.variableSource == VariableSource.Results) {
         codeWriter.write(`${LexyCodeConstants.parameterVariable}.${mapping.variableName}`);
       } else {
         throw new Error(`Invalid source: ${mapping.variableSource}`)
       }

       codeWriter.writeLine(";");
     }
   }
}
