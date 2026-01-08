import type {IComponentNode} from "../../componentNode";
import type {INode} from "../../node";
import type {IValidationContext} from "../../../parser/validationContext";
import type {IHasNodeDependencies} from "../../IHasNodeDependencies";
import type {IComponentNodeList} from "../../componentNodeList";

import {Expression} from "../expression";
import {mapToUsedVariable, VariablesMapping} from "../mapping";
import {asGeneratedType} from "../../variableTypes/generatedType";
import {FillParametersFunctionExpression} from "./systemFunctions/fillParametersFunctionExpression";
import {VariableType} from "../../variableTypes/variableType";
import {NodeType} from "../../nodeType";
import {Function} from "../../functions/function";
import {VariableUsage} from "../variableUsage";
import {FunctionCallExpression} from "./functionCallExpression";
import {ExpressionSource} from "../expressionSource";
import {
  asValidateFunctionArgumentsAutoMapResult,
  asValidateFunctionArgumentsCallFunctionResult
} from "../../functions/validateFunctionArgumentRsult";
import {VariableAccess} from "../variableAccess";
import {castType} from "../../../infrastructure/arrayFunctions";

export function instanceOfLexyFunctionCallExpression(object: any): object is LexyFunctionCallExpression {
  return object?.nodeType == NodeType.LexyFunctionCallExpression;
}

export function asLexyFunctionCallExpression(object: any): LexyFunctionCallExpression | null {
  return instanceOfLexyFunctionCallExpression(object) ? object as LexyFunctionCallExpression : null;
}

export class LexyFunctionCallExpression extends FunctionCallExpression implements IHasNodeDependencies {

  public readonly hasNodeDependencies = true;
  public readonly nodeType = NodeType.LexyFunctionCallExpression;

  public readonly functionName: string

  public readonly args: ReadonlyArray<Expression>;

  public parametersMapping: VariablesMapping | null;
  public parametersTypes: ReadonlyArray<VariableType> | null;
  public resultsObjectType: VariableType | null;

  constructor(functionName: string, argumentValues: ReadonlyArray<Expression>, source: ExpressionSource) {
    super(source);
    this.functionName = functionName;
    this.args = argumentValues;
    this.parametersMapping = null;
    this.parametersTypes = null;
    this.resultsObjectType = null;
  }

  public getDependencies(componentNodes: IComponentNodeList): Array<IComponentNode> {
    let functionNode = componentNodes.getNode(this.functionName);
    return functionNode != null ? [functionNode] : [];
  }

  public override getChildren(): Array<INode> {
    return [...this.args];
  }

  protected override validate(context: IValidationContext): void {
    const functionNode = this.getFunction(context);
    if (functionNode == null) {
      context.logger.fail(this.reference, `Invalid function name: '${this.functionName}'`);
      return;
    }

    const result = functionNode.validateArguments(context, this.args, this.reference);
    if (result == null || result.state != "success") return;

    const autoMapResult = asValidateFunctionArgumentsAutoMapResult(result);
    if (autoMapResult != null) {
      this.autoMapParameters(context, autoMapResult.parameterType);
    }

    const functionCall = asValidateFunctionArgumentsCallFunctionResult(result);
    if (functionCall != null) {
      this.parametersTypes = castType<VariableType>(functionCall.function.parametersTypes);
    }

    this.resultsObjectType = functionNode.getResultsType();
  }

  private autoMapParameters(context: IValidationContext, functionParametersType: VariableType | null) {

    const objectType = asGeneratedType(functionParametersType);
    if (objectType != null) {
      this.parametersMapping = FillParametersFunctionExpression.getMapping(this.reference, context, objectType);
    }
  }

  private getFunction(context: IValidationContext): Function | null {
    return context.componentNodes.getFunction(this.functionName);
  }

  public override deriveType(context: IValidationContext): VariableType | null {
    const functionNode = context.componentNodes.getFunction(this.functionName);
    if (functionNode == null) return null;
    return functionNode.getResultsType();
  }

  public override usedVariables(): ReadonlyArray<VariableUsage> {
    if (this.parametersMapping == null) {
      return super.usedVariables();
    }

    const usedVariable = mapToUsedVariable(VariableAccess.Read);
    return [
      ...super.usedVariables(),
      ...this.parametersMapping.values.map(usedVariable)
    ];
  }
}
