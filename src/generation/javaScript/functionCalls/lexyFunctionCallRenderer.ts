import {CodeWriter} from "../codeWriter";
import {functionClassName} from "../classNames";
import {LexyCodeConstants} from "../lexyCodeConstants";
import {Expression} from "../../../language/expressions/expression";
import {
  instanceOfLexyFunctionCallExpression,
  LexyFunctionCallExpression
} from "../../../language/expressions/functions/lexyFunctionCallExpression";
import {asGeneratedType} from "../../../language/variableTypes/generatedType";
import {GeneratedTypeSource} from "../../../language/variableTypes/generatedTypeSource";
import {VariablesMapping} from "../../../language/expressions/mapping";
import {Assert} from "../../../infrastructure/assert";
import {instanceOfSpreadExpression} from "../../../language/expressions/spreadExpression";
import {translateType} from "../types";
import {renderVariableMappingVariableSyntax} from "../renderers/variableMapping";
import {VariableType} from "../../../language/variableTypes/variableType";

//Syntax: "LexyFunction(variable)"
export class LexyFunctionCallRenderer {

  public static matches(expression: Expression) {
    return instanceOfLexyFunctionCallExpression(expression);
  }

  public static render(expression: LexyFunctionCallExpression, codeWriter: CodeWriter) {

    return LexyFunctionCallRenderer.renderRunFunction(
      expression.functionName,
      expression.args,
      expression.parametersTypes,
      expression.parametersMapping,
      codeWriter);
  }

  public static renderRunFunction(functionName: string,
                                  args: ReadonlyArray<Expression>,
                                  parametersTypes: ReadonlyArray<VariableType> | null,
                                  mapping: VariablesMapping | null,
                                  codeWriter: CodeWriter) {

    codeWriter.writeEnvironment("." + functionClassName(functionName));

    const inline = LexyFunctionCallRenderer.isInline(functionName, parametersTypes);
    if (inline) {
      codeWriter.write(`.` + LexyCodeConstants.inlineMethod);
    }

    codeWriter.write("(");

    if (args.length == 1 && instanceOfSpreadExpression(args[0])) {
      LexyFunctionCallRenderer.renderMappedParametersObject(
        Assert.notNull(mapping, "mapping"),
        codeWriter);
    } else {
      for (const argument of args) {
        codeWriter.renderExpression(argument);
        codeWriter.write(", ");
      }
    }

    codeWriter.write(`${LexyCodeConstants.contextVariable})`);
  }

  private static isInline(functionName: string, parameters: ReadonlyArray<VariableType> | null) {

    if (!parameters) return false;
    if (parameters.length != 1) return true;

    const generatedType = asGeneratedType(parameters[0]);
    if (generatedType == null) return true;

    return generatedType.source != GeneratedTypeSource.FunctionParameters
        && generatedType.node.nodeName != functionName;
  }


  private static renderMappedParametersObject(mappings: VariablesMapping, codeWriter: CodeWriter) {

    codeWriter.write("function() {");
    codeWriter.write(`var ` + LexyCodeConstants.resultsVariable + " = new ");
    codeWriter.writeEnvironment(`.${translateType(mappings.mappingType)}`)
    codeWriter.write("();");

    for (const mapping of mappings.values) {
      codeWriter.write(`${LexyCodeConstants.resultsVariable}.${mapping.variableName} = `);
      renderVariableMappingVariableSyntax(mapping, codeWriter);
      codeWriter.write(";");
    }
    codeWriter.write(`return ${LexyCodeConstants.resultsVariable}; }(), `);
  }
}
