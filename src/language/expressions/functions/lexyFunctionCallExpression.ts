import type {IComponentNode} from "../../componentNode";
import type {INode} from "../../node";
import type {IValidationContext} from "../../../parser/validationContext";
import type {IHasNodeDependencies} from "../../IHasNodeDependencies";
import type {IComponentNodeList} from "../../componentNodeList";

import {Expression} from "../expression";
import {Mapping} from "./mapping";
import {asGeneratedType} from "../../variableTypes/generatedType";
import {FillParametersFunctionExpression} from "./systemFunctions/fillParametersFunctionExpression";
import {ExtractResultsFunctionExpression} from "./systemFunctions/extractResultsFunctionExpression";
import {VariableType} from "../../variableTypes/variableType";
import {NodeType} from "../../nodeType";
import {Function} from "../../functions/function";
import {VariableUsage} from "../variableUsage";
import {FunctionCallExpression} from "./functionCallExpression";
import {ExpressionSource} from "../expressionSource";
import {ILexyFunctionCall, LexyFunctionCall} from "./lexyFunctionCall";
import {AutoMapLexyFunctionCall} from "./autoMapLexyFunctionCallExpression";
import {
  asValidateFunctionArgumentsAutoMapResult,
  asValidateFunctionArgumentsCallFunctionResult,
  ValidateFunctionArgumentsCallFunctionResult
} from "../../functions/validateFunctionArgumentRsult";
import {any, ofTypeOrNull} from "../../../infrastructure/arrayFunctions";

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

  public functionCall: ILexyFunctionCall | null;

  constructor(functionName: string, argumentValues: ReadonlyArray<Expression>, source: ExpressionSource) {
    super(source);
    this.functionName = functionName;
    this.args = argumentValues;
    this.functionCall = null;
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
      this.functionCall = this.autoMapVariables(context, autoMapResult.parameterType, autoMapResult.resultType);
      return;
    }

    const argumentsCall = asValidateFunctionArgumentsCallFunctionResult(result);
    if (argumentsCall != null) {
      this.functionCall = this.callLexyFunction(argumentsCall);
      return;
    }

    throw new Error(`Invalid ValidateArguments result: ${result.state}`);
  }

  private autoMapVariables(context: IValidationContext,
                           functionParametersType: VariableType | null,
                           functionResultsType: VariableType | null): ILexyFunctionCall | null {

    const mappingParameters = new Array<Mapping>();
    const parameterType = asGeneratedType(functionParametersType);
    if (parameterType == null) return null;

    FillParametersFunctionExpression.getMapping(this.reference, context, parameterType, mappingParameters);

    const mappingResults = new Array<Mapping>();
    const resultsType = asGeneratedType(functionResultsType);
    if (resultsType == null) return null;

    ExtractResultsFunctionExpression.getMapping(this.reference, context, resultsType, mappingResults);

    return new AutoMapLexyFunctionCall(
      mappingParameters,
      mappingResults,
      parameterType,
      resultsType);
  }

  private callLexyFunction(result: ValidateFunctionArgumentsCallFunctionResult): ILexyFunctionCall | null {

    if (result.function.resultsType == null) return null;

    const parameters = ofTypeOrNull<VariableType>(result.function.parametersTypes);
    if (parameters == null) return null;

    return new LexyFunctionCall(parameters, result.function.resultsType, this.args);
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
    if (this.functionCall == null) return super.usedVariables();
    return [
      ...super.usedVariables(),
      ...this.functionCall.usedVariables()
    ];
  }
}
