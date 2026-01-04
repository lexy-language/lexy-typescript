import type {IComponentNode} from "../../componentNode";
import type {INode} from "../../node";
import type {IValidationContext} from "../../../parser/validationContext";
import type {IHasNodeDependencies} from "../../IHasNodeDependencies";
import type {IComponentNodeList} from "../../componentNodeList";

import {Expression} from "../expression";
import {Mapping, mapToUsedVariable} from "./mapping";
import {asGeneratedType} from "../../variableTypes/generatedType";
import {FillParametersFunctionExpression} from "./systemFunctions/fillParametersFunctionExpression";
import {ExtractResultsFunctionExpression} from "./systemFunctions/extractResultsFunctionExpression";
import {VariableType} from "../../variableTypes/variableType";
import {NodeType} from "../../nodeType";
import {Function} from "../../functions/function";
import {Assert} from "../../../infrastructure/assert";
import {VariableUsage} from "../variableUsage";
import {VariableAccess} from "../variableAccess";
import {FunctionCallExpression} from "./functionCallExpression";
import {ExpressionSource} from "../expressionSource";
import {asIdentifierExpression} from "../identifierExpression";

export function instanceOfLexyFunctionCallExpression(object: any): object is LexyFunctionCallExpression {
  return object?.nodeType == NodeType.LexyFunctionCallExpression;
}

export function asLexyFunctionCallExpression(object: any): LexyFunctionCallExpression | null {
  return instanceOfLexyFunctionCallExpression(object) ? object as LexyFunctionCallExpression : null;
}

export class LexyFunctionCallExpression extends FunctionCallExpression implements IHasNodeDependencies {

  private readonly mappingParametersValue: Array<Mapping> = [];
  private readonly mappingResultsValue: Array<Mapping> = [];

  private parameterNameValue: string | null = null;
  private functionParametersTypesValue: VariableType | null = null;
  private functionResultsTypeValue: VariableType | null = null;
  private autoMapValue: boolean = false;

  public readonly hasNodeDependencies = true;
  public readonly nodeType = NodeType.LexyFunctionCallExpression;

  public readonly functionName: string

  public readonly args: ReadonlyArray<Expression>;

  public get mappingParameters(): ReadonlyArray<Mapping> {
    return this.mappingParametersValue;
  }

  public get mappingResults(): ReadonlyArray<Mapping> {
    return this.mappingResultsValue;
  }

  public get parameterName(): string | null {
    return this.parameterNameValue;
  }

  public get autoMap(): boolean {
    return this.autoMapValue;
  }

  public get functionParametersType(): VariableType {
    return Assert.notNull(this.functionParametersTypesValue, "functionParametersType");
  }

  public get functionResultType(): VariableType {
    return Assert.notNull(this.functionResultsTypeValue, "functionParametersType");
  }

  constructor(functionName: string, argumentValues: ReadonlyArray<Expression>, source: ExpressionSource) {
    super(source);
    this.functionName = functionName;
    this.args = argumentValues;
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

    const result = functionNode.validateArguments(context, this.args);
    if (result.state != "success") return;

    if (result.autoMap)
    {
      this.autoMapValue = true;
      this.functionResultsTypeValue = result.resultType;
      this.functionParametersTypesValue = result.parameterType;
      this.autoMapVariables(context, result.parameterType, result.resultType);
    }

    this.parameterNameValue = this.getParameterName();
  }

  private autoMapVariables(context: IValidationContext, functionParametersType: VariableType | null, functionResultsType: VariableType) {
    const complexParameterType = asGeneratedType(functionParametersType);
    if (complexParameterType != null) {
        FillParametersFunctionExpression.getMapping(this.reference, context, complexParameterType, this.mappingParametersValue);
    }

    const complexResultsType = asGeneratedType(functionResultsType);
    if (complexResultsType != null) {
      ExtractResultsFunctionExpression.getMapping(this.reference, context, complexResultsType, this.mappingResultsValue);
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
    return [
      ...super.usedVariables(),
      ...this.mappingParameters.map(mapToUsedVariable(VariableAccess.Read)),
      ...this.mappingResults.map(mapToUsedVariable(VariableAccess.Write))
    ];
  }

  private getParameterName(): string | null {
    if (this.args.length == 0) return null;

    const expressionArgument = asIdentifierExpression(this.args[0]);
    if (expressionArgument == null) return expressionArgument;

    return expressionArgument.identifier;
  }
}
