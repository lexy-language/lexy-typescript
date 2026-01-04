import {Expression} from "../../../language/expressions/expression";
import {asFunctionCallExpression} from "../../../language/expressions/functions/functionCallExpression";
import {
  asVariableDeclarationExpression,
  VariableDeclarationExpression
} from "../../../language/expressions/variableDeclarationExpression";
import {
  asFillParametersFunctionExpression,
  instanceOfFillParametersFunctionExpression
} from "../../../language/expressions/functions/systemFunctions/fillParametersFunctionExpression";
import {VariableType} from "../../../language/variableTypes/variableType";
import {Mapping} from "../../../language/expressions/functions/mapping";
import {VariableSource} from "../../../language/variableSource";
import {LexyCodeConstants} from "../lexyCodeConstants";
import {translateType} from "../types";
import {CodeWriter} from "../codeWriter";

//Syntax: "var result = fill(params)"
export class FillFunctionStatement {

  public static matches(expression: Expression): boolean {
    const assignmentExpression = asVariableDeclarationExpression(expression);
    if (assignmentExpression == null) return false;

    const functionCallExpression = asFunctionCallExpression(assignmentExpression.assignment);
    if (functionCallExpression == null) return false;

    return instanceOfFillParametersFunctionExpression(functionCallExpression);
  }

   public static render(assignmentExpression: VariableDeclarationExpression, codeWriter: CodeWriter) {

     const functionCallExpression = asFunctionCallExpression(assignmentExpression.assignment);
     if (functionCallExpression == null) throw new Error(`assignmentExpression.assignment should be FunctionCallExpression`);

     const fillParametersFunctionExpression = asFillParametersFunctionExpression(functionCallExpression);
     if (fillParametersFunctionExpression == null) throw new Error("Expression not FillParametersFunctionExpression: " + functionCallExpression)

     return FillFunctionStatement.renderFill(assignmentExpression.name, fillParametersFunctionExpression.type, fillParametersFunctionExpression.mapping, codeWriter);
   }

   public static renderFill(variableName: string, type: VariableType, mappings: ReadonlyArray<Mapping>, codeWriter: CodeWriter) {
     codeWriter.write(`const ` + variableName + " = new ");
     codeWriter.writeEnvironment(`.${translateType(type)}`)
     codeWriter.endLine("();");

     for (const mapping of mappings) {
       codeWriter.startLine(variableName + "." + mapping.variableName + " = ");

       if (mapping.variableSource == VariableSource.Code) {
         codeWriter.write(mapping.variableName);
       } else  if (mapping.variableSource == VariableSource.Results) {
         codeWriter.write(`${LexyCodeConstants.resultsVariable}.${mapping.variableName}`);
       } else  if (mapping.variableSource == VariableSource.Parameters) {
         codeWriter.write(`${LexyCodeConstants.parameterVariable}.${mapping.variableName}`);
       } else {
         throw new Error(`Invalid source: ${mapping.variableSource}`)
       }

       codeWriter.writeLine(";");
     }
   }
}
