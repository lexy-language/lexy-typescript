import {CodeWriter} from "../codeWriter";
import {functionClassName} from "../classNames";
import {LexyCodeConstants} from "../lexyCodeConstants";
import {Expression} from "../../../language/expressions/expression";
import {
  instanceOfLexyFunctionCallExpression,
  LexyFunctionCallExpression
} from "../../../language/expressions/functions/lexyFunctionCallExpression";
import {asLexyFunctionCall, LexyFunctionCall} from "../../../language/expressions/functions/lexyFunctionCall";
import {Assert} from "../../../infrastructure/assert";
import {VariableType} from "../../../language/variableTypes/variableType";
import {asGeneratedType} from "../../../language/variableTypes/generatedType";
import {GeneratedTypeSource} from "../../../language/variableTypes/generatedTypeSource";

//Syntax: "LexyFunction(variable)"
export class LexyFunctionCallRenderer {

  public static matches(expression: Expression) {
    return instanceOfLexyFunctionCallExpression(expression);
  }

  public static render(expression: LexyFunctionCallExpression, codeWriter: CodeWriter) {

    const functionCall = Assert.is<LexyFunctionCall>(asLexyFunctionCall, expression.functionCall, "expression.functionCall as LexyFunctionCallRenderer");

    return LexyFunctionCallRenderer.renderRunFunction(
      expression.functionName,
      expression.args,
      functionCall.parametersTypes,
      codeWriter);
  }

  public static renderRunFunction(functionName: string,
                                  args: ReadonlyArray<Expression>,
                                  parametersTypes: ReadonlyArray<VariableType>,
                                  codeWriter: CodeWriter) {

    codeWriter.writeEnvironment("." + functionClassName(functionName));

    const inline = LexyFunctionCallRenderer.isInline(functionName, parametersTypes);
    if (inline) {
      codeWriter.write(`.` + LexyCodeConstants.inlineMethod);
    }

    codeWriter.write("(");

    for (const argument of args) {
      codeWriter.renderExpression(argument);
      codeWriter.write(", ");
    }

    codeWriter.write(`${LexyCodeConstants.contextVariable})`);
  }

  private static isInline(functionName: string, parameters: ReadonlyArray<VariableType>) {

    if (parameters.length != 1) return true;

    const generatedType = asGeneratedType(parameters[0]);
    if (generatedType == null) return true;

    return generatedType.source != GeneratedTypeSource.FunctionParameters
        && generatedType.node.nodeName != functionName;
  }
}
