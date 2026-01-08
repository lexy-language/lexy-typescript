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
import {VariablesMapping} from "../../../language/expressions/mapping";
import {translateType} from "../types";
import {CodeWriter} from "../codeWriter";
import {renderVariableMappingVariableSyntax} from "../renderers/variableMapping";
import {Assert} from "../../../infrastructure/assert";

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

     FillFunctionStatement.renderFill(
       assignmentExpression.name,
       fillParametersFunctionExpression.type,
       Assert.notNull(fillParametersFunctionExpression.mapping, "fillParametersFunctionExpression.mapping"),
       codeWriter);
   }

   public static renderFill(variableName: string, type: VariableType, mappings: VariablesMapping, codeWriter: CodeWriter) {

     codeWriter.write(`const ` + variableName + " = new ");
     codeWriter.writeEnvironment(`.${translateType(type)}`)
     codeWriter.endLine("();");

     for (const mapping of mappings.values) {
       codeWriter.startLine(variableName + "." + mapping.variableName + " = ");

       renderVariableMappingVariableSyntax(mapping, codeWriter);

       codeWriter.writeLine(";");
     }
   }
}
