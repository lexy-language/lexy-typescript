import type {IRootNode} from "../../rootNode";
import type {INode} from "../../node";
import type {IValidationContext} from "../../../parser/validationContext";
import type {IHasNodeDependencies} from "../../IHasNodeDependencies";
import type {IRootNodeList} from "../../rootNodeList";

import {Expression} from "../expression";
import {Mapping, mapToUsedVariable} from "./mapping";
import {ComplexType} from "../../variableTypes/complexType";
import {FillParametersFunction} from "./fillParametersFunction";
import {ExtractResultsFunction} from "./extractResultsFunction";
import {asIdentifierExpression} from "../identifierExpression";
import {VariableType} from "../../variableTypes/variableType";
import {NodeType} from "../../nodeType";
import {Assert} from "../../../infrastructure/assert";
import {VariableUsage} from "../variableUsage";
import {VariableAccess} from "../variableAccess";
import {FunctionCallExpression} from "./functionCallExpression";
import {ExpressionSource} from "../expressionSource";

export function instanceOfLexyFunction(object: any): object is LexyFunction {
  return object?.nodeType == NodeType.LexyFunction;
}

export function asLexyFunction(object: any): LexyFunction | null {
  return instanceOfLexyFunction(object) ? object as LexyFunction : null;
}

export class LexyFunction extends FunctionCallExpression implements IHasNodeDependencies {

  private variableNameValue: string | null = null;
  private functionParametersTypeValue: ComplexType | null = null;
  private functionResultsTypeValue: ComplexType | null = null;

  public readonly hasNodeDependencies = true;
  public readonly nodeType = NodeType.LexyFunction;

  public readonly functionName: string
  public readonly argumentValues: Array<Expression>;

  public get variableName(): string | null {
    return this.variableNameValue;
  }

  private readonly mappingParametersValue: Array<Mapping> = [];
  private readonly mappingResultsValue: Array<Mapping> = [];

  public get functionParametersType(): ComplexType {
    return Assert.notNull(this.functionParametersTypeValue, "functionParametersType");
  }

  public get mappingParameters(): ReadonlyArray<Mapping> {
    return this.mappingParametersValue;
  }

  public get mappingResults(): ReadonlyArray<Mapping> {
    return this.mappingResultsValue;
  }

  constructor(functionName: string, argumentValues: Array<Expression>, source: ExpressionSource) {
    super(functionName, source);
    this.functionName = functionName;
    this.argumentValues = argumentValues;
  }

  public getDependencies(rootNodeList: IRootNodeList): Array<IRootNode> {
    let functionNode = rootNodeList.getFunction(this.functionName);
    return functionNode != null ? [functionNode] : [];
  }

  public override getChildren(): Array<INode> {
    return [...this.argumentValues];
  }

  protected override validate(context: IValidationContext): void {
    let functionNode = context.rootNodes.getFunction(this.functionName);
    if (functionNode == null) {
      context.logger.fail(this.reference, `Invalid function name: '${this.functionName}'`);
      return;
    }

    if (this.argumentValues.length > 1) {
      context.logger.fail(this.reference, `Invalid function argument: '${this.functionName}'. Should be 0 or 1`);
      return;
    }

    if (this.argumentValues.length == 0) {
      FillParametersFunction.getMapping(this.reference, context, functionNode.getParametersType(), this.mappingParametersValue);
      ExtractResultsFunction.getMapping(this.reference, context, functionNode.getResultsType(), this.mappingResultsValue);

      this.functionParametersTypeValue = functionNode.getParametersType();
      this.functionResultsTypeValue = functionNode.getResultsType();

      return;
    }

    let argumentType = this.argumentValues[0].deriveType(context);
    let parametersType = functionNode.getParametersType();

    if (argumentType == null || !argumentType.equals(parametersType)) {
      context.logger.fail(this.reference, `Invalid function argument: '${this.functionName}'. ` +
        `Argument should be of type function parameters. Use new(Function) of fill(Function) to create an variable of the function result type.`);
    }

    const identifierExpression = asIdentifierExpression(this.argumentValues[0]);
    this.variableNameValue = identifierExpression != null ? identifierExpression.identifier : null;
  }

  public override deriveType(context: IValidationContext): VariableType | null {
    const functionNode = context.rootNodes.getFunction(this.functionName);
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
}
