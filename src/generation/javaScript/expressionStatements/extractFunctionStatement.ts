import {Expression} from "../../../language/expressions/expression";
import {
  asFunctionCallExpression
} from "../../../language/expressions/functions/functionCallExpression";
import {CodeWriter} from "../codeWriter";
import {Mapping, VariablesMapping} from "../../../language/expressions/mapping";
import {VariableSource} from "../../../language/variableSource";
import {LexyCodeConstants} from "../lexyCodeConstants";
import {
  asExtractResultsFunctionExpression, ExtractResultsFunctionExpression,
  instanceOfExtractResultsFunctionExpression
} from "../../../language/expressions/functions/systemFunctions/extractResultsFunctionExpression";
import {Assert} from "../../../infrastructure/assert";
import {renderVariableMappingVariableSyntax} from "../renderers/variableMapping";

//Syntax: "extract(params)"
export class ExtractFunctionStatement {

  public static matches(expression: Expression): boolean {

    const functionCallExpression = asFunctionCallExpression(expression);
    if (functionCallExpression == null) return false;

    return instanceOfExtractResultsFunctionExpression(functionCallExpression);
  }

  public static render(functionCallExpression: ExtractResultsFunctionExpression, codeWriter: CodeWriter) {

    const extractResultsFunction = Assert.is<ExtractResultsFunctionExpression>(asExtractResultsFunctionExpression, functionCallExpression, "functionCallExpression");

    return ExtractFunctionStatement.renderExtract(
      Assert.notNull(extractResultsFunction.mapping, "extractResultsFunction.mapping"),
      Assert.notNull(extractResultsFunction.functionResultVariable, "extractResultsFunction.functionResultVariable"),
      codeWriter);
  }

  public static renderExtract(mappings: VariablesMapping, functionResultVariable: string, codeWriter: CodeWriter) {
    for (const mapping of mappings.values) {
      this.renderMapping(functionResultVariable, mapping, codeWriter);
    }
  }

  private static renderMapping(functionResultVariable: string, mapping: Mapping, codeWriter: CodeWriter) {

    codeWriter.startLine();

    renderVariableMappingVariableSyntax(mapping, codeWriter);

    codeWriter.write(" = ");
    codeWriter.endLine(`${functionResultVariable}.${mapping.variableName};`);
  }
}