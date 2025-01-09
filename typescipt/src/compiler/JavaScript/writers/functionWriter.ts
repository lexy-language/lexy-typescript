import type {IRootTokenWriter} from "../../IRootTokenWriter";
import type {IRootNode} from "../../../language/rootNode";
import {LexyCodeConstants} from "../../lexyCodeConstants";
import {GeneratedType, GeneratedTypeKind} from "../../generatedType";
import {asFunction, Function} from "../../../language/functions/function";
import {NodesWalker} from "../../../language/nodesWalker";
import {asFunctionCallExpression} from "../../../language/expressions/functionCallExpression";
import {CodeWriter} from "./codeWriter";
import {functionClassName} from "../classNames";
import {renderExpressions} from "../renderers/renderExpression";
import {createVariableClass} from "../renderers/renderVariableClass";
import {renderCustomBuiltInFunctions} from "../builtInFunctions/createFunctionCall";

export class FunctionWriter implements IRootTokenWriter {

  private readonly namespace: string;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  public createCode(node: IRootNode): GeneratedType {
    const functionNode = asFunction(node);
    if (functionNode == null) throw new Error(`Root token not Function`);

    const codeWriter = new CodeWriter(this.namespace)

    return this.createFunction(functionNode, codeWriter);
  }

  private createFunction(functionNode: Function, codeWriter: CodeWriter) {

    codeWriter.openScope("function scope()");
    this.renderCustomBuiltInFunctions(functionNode, codeWriter)
    this.renderRunFunction(functionNode, codeWriter);
    createVariableClass(LexyCodeConstants.parametersType, functionNode.parameters.variables, codeWriter);
    createVariableClass(LexyCodeConstants.resultsType, functionNode.results.variables, codeWriter);
    codeWriter.writeLine(`${LexyCodeConstants.runMethod}.${LexyCodeConstants.parametersType} = ${LexyCodeConstants.parametersType};`)
    codeWriter.writeLine(`${LexyCodeConstants.runMethod}.${LexyCodeConstants.resultsType} = ${LexyCodeConstants.resultsType};`)
    codeWriter.writeLine(`return ${LexyCodeConstants.runMethod};`)
    codeWriter.closeScope("();");

    return new GeneratedType(GeneratedTypeKind.function, functionNode, functionClassName(functionNode.nodeName), codeWriter.toString());
  }

  private renderRunFunction(functionNode: Function, codeWriter: CodeWriter) {
    
    codeWriter.openScope(`function ${LexyCodeConstants.runMethod}(${LexyCodeConstants.parameterVariable}, ${LexyCodeConstants.contextVariable})`);

    this.renderResults(functionNode, codeWriter)
    this.renderCode(functionNode, codeWriter);

    codeWriter.writeLine(`return ${LexyCodeConstants.resultsVariable};`);

    codeWriter.closeScope();
  }

  private renderCode(functionNode: Function, codeWriter: CodeWriter) {
    renderExpressions(functionNode.code.expressions, codeWriter);
  }

  private renderResults(functionNode: Function, codeWriter: CodeWriter) {
    codeWriter.writeLine(`const ${LexyCodeConstants.resultsVariable} = new ${LexyCodeConstants.resultsType}();`);
  }

  private renderCustomBuiltInFunctions(functionNode: Function, codeWriter: CodeWriter) {
    return NodesWalker.walkWithResult(functionNode.code.expressions,
      node => {
        const expression = asFunctionCallExpression(node);
        if (expression != null) {
          renderCustomBuiltInFunctions(expression.expressionFunction, codeWriter)
        }
      });
  }
}

