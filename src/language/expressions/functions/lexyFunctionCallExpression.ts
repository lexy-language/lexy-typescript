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
  asValidateFunctionArgumentsAutoMapResult, asValidateFunctionArgumentsCallFunctionResult,
  ValidateFunctionArgumentsResult
} from "../../functions/validateFunctionArgumentRsult";
import {VariableAccess} from "../variableAccess";
import {instanceOfSpreadAssignmentExpression} from "../spreadAssignmentExpression";
import {VariableDefinition} from "../../variableDefinition";
import {castType} from "../../../infrastructure/arrayFunctions";

export function instanceOfLexyFunctionCallExpression(object: any): object is LexyFunctionCallExpression {
  return object?.nodeType == NodeType.LexyFunctionCallExpression;
}

export function asLexyFunctionCallExpression(object: any): LexyFunctionCallExpression | null {
  return instanceOfLexyFunctionCallExpression(object) ? object as LexyFunctionCallExpression : null;
}

export class LexyFunctionCallState {

  public parametersMapping: VariablesMapping | null;
  public parametersTypes: ReadonlyArray<VariableType> | null;
  public resultsObjectType: VariableType;
  public returnSingleResultsVariablesName: string | null;

  constructor(parametersMapping: VariablesMapping | null,
              parametersTypes: ReadonlyArray<VariableType> | null,
              resultsObjectType: VariableType,
              returnSingleResultsVariablesName: string | null) {
    this.parametersMapping = parametersMapping;
    this.parametersTypes = parametersTypes;
    this.resultsObjectType = resultsObjectType;
    this.returnSingleResultsVariablesName = returnSingleResultsVariablesName;
  }
}

export class LexyFunctionCallExpression extends FunctionCallExpression implements IHasNodeDependencies {

  public readonly hasNodeDependencies = true;
  public readonly nodeType = NodeType.LexyFunctionCallExpression;

  public readonly functionName: string

  public readonly args: ReadonlyArray<Expression>;

  public state: LexyFunctionCallState | null;

  constructor(functionName: string, argumentValues: ReadonlyArray<Expression>, source: ExpressionSource) {
    super(source);
    this.functionName = functionName;
    this.args = argumentValues;
    this.state = null;
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

    const parametersMapping = this.autoMapParameters(result, context);
    const parametersTypes = this.getParametersTypes(result);
    const resultsObjectType = functionNode.getResultsType();
    const returnSingleResultsVariablesName = this.returnSingleResultsVariablesName(functionNode);
    this.state = new LexyFunctionCallState(parametersMapping, parametersTypes, resultsObjectType, returnSingleResultsVariablesName);
  }

  private getParametersTypes(result: ValidateFunctionArgumentsResult) {
    const functionCall = asValidateFunctionArgumentsCallFunctionResult(result);
    return functionCall != null ? castType<VariableType>(functionCall.function.parametersTypes) : null;
  }

  private autoMapParameters(result: ValidateFunctionArgumentsResult, context: IValidationContext) {

    const autoMapResult = asValidateFunctionArgumentsAutoMapResult(result);
    if (autoMapResult == null) return null;

    const objectType = asGeneratedType(autoMapResult.parameterType);
    if (objectType != null) {
      return FillParametersFunctionExpression.getMapping(this.reference, context, objectType);
    }
    return null;
  }

  private getFunction(context: IValidationContext): Function | null {
    return  context.componentNodes.getFunction(this.functionName);
  }

  public override deriveType(context: IValidationContext): VariableType | null {
    const functionNode = context.componentNodes.getFunction(this.functionName);
    if (!functionNode) return null;
    const variable = this.returnSingleResultsVariable(functionNode);
    return variable != null ? variable.type.variableType : functionNode.getResultsType();
  }

  private returnSingleResultsVariablesName(functionNode: Function): string | null {
    const variable = this.returnSingleResultsVariable(functionNode);
    return variable != null ? variable.name : null;
  }

  private returnSingleResultsVariable(functionNode: Function): VariableDefinition | null {
    const parentIsSpreadExpression = instanceOfSpreadAssignmentExpression(this.parent);
    return !parentIsSpreadExpression && functionNode.results.variables.length == 1
      ? functionNode.results.variables[0]
      : null;
  }

  public override usedVariables(): ReadonlyArray<VariableUsage> {
    if (!this.state?.parametersMapping) {
      return super.usedVariables();
    }

    const usedVariable = mapToUsedVariable(VariableAccess.Read);
    return [
      ...super.usedVariables(),
      ...this.state.parametersMapping.values.map(usedVariable)
    ];
  }
}
