import type {IRootTokenWriter} from "../../IRootTokenWriter";
import type {IRootNode} from "../../../language/rootNode";

import {LexyCodeConstants} from "../lexyCodeConstants";
import {GeneratedType, GeneratedTypeKind} from "../../generatedType";
import {asFunction, Function} from "../../../language/functions/function";
import {CodeWriter} from "./codeWriter";
import {functionClassName} from "../classNames";
import {renderExpressions} from "../renderers/renderExpression";
import {createVariableClass} from "../renderers/renderVariableClass";

export class FunctionWriter implements IRootTokenWriter {

  public createCode(node: IRootNode): GeneratedType {
    const functionNode = asFunction(node);
    if (functionNode == null) throw new Error(`Root token not Function`);

    const codeWriter = new CodeWriter()

    return this.createFunction(functionNode, codeWriter);
  }

  private createFunction(functionNode: Function, codeWriter: CodeWriter) {

    const name = functionClassName(functionNode.nodeName);

    codeWriter.openScope(`function ${name}()`);

    FunctionWriter.renderValidateParametersMethod(codeWriter);

    this.renderRunFunction(functionNode, codeWriter);

    createVariableClass(`${functionNode.nodeName}.Parameters`, LexyCodeConstants.parametersType, functionNode.parameters?.variables, codeWriter);
    createVariableClass(`${functionNode.nodeName}.Results`, LexyCodeConstants.resultsType, functionNode.results?.variables, codeWriter);

    codeWriter.writeLine(`${LexyCodeConstants.runMethod}.${LexyCodeConstants.parametersType} = ${LexyCodeConstants.parametersType};`)
    codeWriter.writeLine(`${LexyCodeConstants.runMethod}.${LexyCodeConstants.resultsType} = ${LexyCodeConstants.resultsType};`)
    codeWriter.writeLine(`${LexyCodeConstants.runMethod}.${LexyCodeConstants.validateMethod} = ${LexyCodeConstants.validateMethod};`)

    codeWriter.writeLine(`return ${LexyCodeConstants.runMethod};`)

    codeWriter.closeScope("();");

    return new GeneratedType(GeneratedTypeKind.Function, functionNode,  name, codeWriter.toString());
  }

  private renderRunFunction(functionNode: Function, codeWriter: CodeWriter) {

    codeWriter.openScope(`function ${LexyCodeConstants.runMethod}(${LexyCodeConstants.parameterVariable}, ${LexyCodeConstants.contextVariable})`);

    FunctionWriter.renderResults(codeWriter)
    codeWriter.writeLine(`${LexyCodeConstants.contextVariable}.setFileName("${functionNode.reference.file.fileName}");`)
    codeWriter.writeLine(`${LexyCodeConstants.contextVariable}.openScope("Execute: ${functionNode.nodeName}", ${functionNode.reference.lineNumber});`)
    codeWriter.writeLine(`${LexyCodeConstants.contextVariable}.log("Parameters", ${functionNode.parameters?.reference.lineNumber}, ${LexyCodeConstants.parameterVariable});`)
    codeWriter.writeLine();

    FunctionWriter.renderCode(functionNode, codeWriter);

    codeWriter.writeLine(`${LexyCodeConstants.contextVariable}.log("Results",  ${functionNode.results?.reference.lineNumber},${LexyCodeConstants.resultsVariable});`)
    codeWriter.writeLine(`${LexyCodeConstants.contextVariable}.closeScope();`)

    codeWriter.writeLine(`return ${LexyCodeConstants.resultsVariable};`);

    codeWriter.closeScope();
    codeWriter.writeLine();
  }

  private static renderCode(functionNode: Function, codeWriter: CodeWriter) {
    renderExpressions(functionNode.code?.expressions, false, codeWriter);
  }

  private static renderResults(codeWriter: CodeWriter) {
    codeWriter.writeLine(`const ${LexyCodeConstants.resultsVariable} = new ${LexyCodeConstants.resultsType}();`);
  }

  private static renderValidateParametersMethod(codeWriter: CodeWriter) {
    codeWriter.openScope(`function ${LexyCodeConstants.validateMethod}(${LexyCodeConstants.parameterVariable})`);
    codeWriter.writeLine("const validationErrors = [];");
    codeWriter.writeLine(`${LexyCodeConstants.parametersType}.${LexyCodeConstants.validateMethod}(null, ${LexyCodeConstants.parameterVariable}, validationErrors);`);
    codeWriter.openScope(`if (validationErrors.length > 0)`);
    codeWriter.writeLine(`  throw new Error("Validation failed: \\n" + validationErrors.join("\\n"));`);
    codeWriter.closeScope();
    codeWriter.closeScope();
    codeWriter.writeLine()
  }
}

