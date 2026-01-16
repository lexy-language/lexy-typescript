import {LexyCodeConstants} from "../lexyCodeConstants";
import {GeneratedType, GeneratedTypeKind} from "../../generatedType";
import {asFunction, Function} from "../../../language/functions/function";
import {functionClassName} from "../classNames";
import {renderExpression, renderExpressions} from "../renderers/renderExpression";
import {createVariableClass} from "../renderers/renderVariableClass";
import {CodeWriter} from "../codeWriter";

export function createFunctionCode(node: Function): GeneratedType {
    const functionNode = asFunction(node);
    if (functionNode == null) throw new Error(`Component token not Function`);

    const codeWriter = new CodeWriter(renderExpression)

    return createFunction(functionNode, codeWriter);
  }

function createFunction(functionNode: Function, codeWriter: CodeWriter) {

  const name = functionClassName(functionNode.nodeName);

  codeWriter.openScope(`function ${name}()`);

  renderValidateParametersMethod(codeWriter);

  renderRunFunction(functionNode, codeWriter);
  renderRunInlineFunction(functionNode, codeWriter);

  createVariableClass(`${functionNode.nodeName}.Parameters`, LexyCodeConstants.parametersType, functionNode.parameters?.variables, codeWriter);
  createVariableClass(`${functionNode.nodeName}.Results`, LexyCodeConstants.resultsType, functionNode.results?.variables, codeWriter);

  codeWriter.writeLine(`${LexyCodeConstants.runMethod}.${LexyCodeConstants.inlineMethod} = ${LexyCodeConstants.inlineMethod}(${LexyCodeConstants.runMethod});`)
  codeWriter.writeLine(`${LexyCodeConstants.runMethod}.${LexyCodeConstants.parametersType} = ${LexyCodeConstants.parametersType};`)
  codeWriter.writeLine(`${LexyCodeConstants.runMethod}.${LexyCodeConstants.resultsType} = ${LexyCodeConstants.resultsType};`)
  codeWriter.writeLine(`${LexyCodeConstants.runMethod}.${LexyCodeConstants.validateMethod} = ${LexyCodeConstants.validateMethod};`)

  codeWriter.writeLine(`return ${LexyCodeConstants.runMethod};`)

  codeWriter.closeScope("();");

  return new GeneratedType(GeneratedTypeKind.Function, functionNode,  name, codeWriter.toString());
}

function getResultsVariable(functionNode: Function) {

  if (functionNode.results.variables.length != 1) return LexyCodeConstants.resultsVariable;

  let variableDefinition = functionNode.results.variables[0];
  return `${LexyCodeConstants.resultsVariable}.${variableDefinition.name}`;
}

function renderRunFunction(functionNode: Function, codeWriter: CodeWriter) {

  codeWriter.openScope(`function ${LexyCodeConstants.runMethod}(${LexyCodeConstants.parameterVariable}, ${LexyCodeConstants.contextVariable})`);

  renderResults(codeWriter)

  codeWriter.writeLine(`${LexyCodeConstants.contextVariable}.setFileName("${functionNode.reference.file.fileName}");`)
  codeWriter.writeLine(`${LexyCodeConstants.contextVariable}.openScope("Execute: ${functionNode.nodeName}", ${functionNode.reference.lineNumber});`)
  codeWriter.writeLine(`${LexyCodeConstants.contextVariable}.log("Parameters", ${functionNode.parameters?.reference.lineNumber}, ${LexyCodeConstants.parameterVariable});`)
  codeWriter.writeLine();

  renderCode(functionNode, codeWriter);

  codeWriter.writeLine(`${LexyCodeConstants.contextVariable}.log("Results",  ${functionNode.results?.reference.lineNumber}, ${LexyCodeConstants.resultsVariable});`)
  codeWriter.writeLine(`${LexyCodeConstants.contextVariable}.closeScope();`)

  codeWriter.writeLine(`return ${(getResultsVariable(functionNode))};`);

  codeWriter.closeScope();
  codeWriter.writeLine();
}

function renderCode(functionNode: Function, codeWriter: CodeWriter) {
  renderExpressions(functionNode.code?.expressions, false, codeWriter);
}

function renderResults(codeWriter: CodeWriter) {
  codeWriter.writeLine(`const ${LexyCodeConstants.resultsVariable} = new ${LexyCodeConstants.resultsType}();`);
}

function renderValidateParametersMethod(codeWriter: CodeWriter) {
  codeWriter.openScope(`function ${LexyCodeConstants.validateMethod}(${LexyCodeConstants.parameterVariable})`);
  codeWriter.writeLine("const validationErrors = [];");
  codeWriter.writeLine(`${LexyCodeConstants.parametersType}.${LexyCodeConstants.validateMethod}(null, ${LexyCodeConstants.parameterVariable}, validationErrors);`);
  codeWriter.openScope(`if (validationErrors.length > 0)`);
  codeWriter.writeLine(`  throw new Error("Validation failed: \\n" + validationErrors.join("\\n"));`);
  codeWriter.closeScope();
  codeWriter.closeScope();
  codeWriter.writeLine()
}

function renderRunInlineFunction(functionNode: Function, codeWriter: CodeWriter) {

  codeWriter.openScope(`function ${LexyCodeConstants.inlineMethod}(${LexyCodeConstants.runMethod})`);

  codeWriter.write(`return function ${LexyCodeConstants.inlineMethod}(`);
  renderParameterNames(functionNode, codeWriter);
  codeWriter.openScope(`${LexyCodeConstants.contextVariable})`);

  renderCreateParameterObject(codeWriter, functionNode);

  codeWriter.writeLine(`return ${LexyCodeConstants.runMethod}(${LexyCodeConstants.parameterVariable}, ${LexyCodeConstants.contextVariable});`);

  codeWriter.closeScope();
  codeWriter.closeScope();
  codeWriter.writeLine();
}

function renderCreateParameterObject(codeWriter: CodeWriter, functionNode: Function) {
  codeWriter.writeLine(`const ${LexyCodeConstants.parameterVariable} = new ${LexyCodeConstants.runMethod}.${LexyCodeConstants.parametersType}();`);

  for (let index = 0; index < functionNode.parameters.variables.length; index++) {
    const parameter = functionNode.parameters.variables[index];
    codeWriter.writeLine(`${LexyCodeConstants.parameterVariable}.${parameter.name} = ${parameter.name};`);
  }
}

function renderParameterNames(functionNode: Function, codeWriter: CodeWriter) {
  for (let index = 0; index < functionNode.parameters.variables.length; index++) {
    const parameter = functionNode.parameters.variables[index];
    codeWriter.write(parameter.name);
    codeWriter.write(", ");
  }
}
