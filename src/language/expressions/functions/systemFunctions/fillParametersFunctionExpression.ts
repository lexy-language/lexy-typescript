import type {IComponentNode} from "../../../componentNode";
import type {INode} from "../../../node";
import type {IValidationContext} from "../../../../parser/context/validationContext";
import type {IHasNodeDependencies} from "../../../IHasNodeDependencies";
import type {IComponentNodeList} from "../../../componentNodeList";

import {Mapping, mapToUsedVariable, VariablesMapping} from "../../mapping";
import {MemberAccessToken} from "../../../../parser/tokens/memberAccessToken";
import {Expression} from "../../expression";
import {SourceReference} from "../../../sourceReference";
import {asMemberAccessExpression} from "../../memberAccessExpression";
import {asGeneratedType, GeneratedType} from "../../../typeSystem/objects/generatedType";
import {Type} from "../../../typeSystem/type";
import {Function} from "../../../functions/function";
import {NodeType} from "../../../nodeType";
import {VariableUsage} from "../../variableUsage";
import {VariableAccess} from "../../variableAccess";
import {FunctionCallExpression} from "../functionCallExpression";
import {ExpressionSource} from "../../expressionSource";
import {NodeReference} from "../../../nodeReference";
import {SymbolKind} from "../../../symbols/symbolKind";
import {Symbol} from "../../../symbols/symbol";
import {ExtractResultsFunctionState} from "./extractResultsFunctionExpression";

export function instanceOfFillParametersFunctionExpression(object: any): object is FillParametersFunctionExpression {
  return object?.nodeType == NodeType.FillParametersFunctionExpression;
}

export function asFillParametersFunctionExpression(object: any): FillParametersFunctionExpression | null {
  return instanceOfFillParametersFunctionExpression(object) ? object as FillParametersFunctionExpression : null;
}

export class FillParametersFunctionState {

  public mapping: VariablesMapping;
  public type: GeneratedType;

  constructor(type: GeneratedType, mapping: VariablesMapping) {
    this.type = type;
    this.mapping = mapping;
  }
}

export class FillParametersFunctionExpression extends FunctionCallExpression implements IHasNodeDependencies {

  public static readonly functionName: string = `fill`;

  private get functionHelp() {
    return `${FillParametersFunctionExpression.functionName} expects 1 argument (Function.Parameters)`;
  }

  private stateValue: FillParametersFunctionState | null = null;

  public readonly hasNodeDependencies = true;
  public readonly nodeType = NodeType.FillParametersFunctionExpression;

  public readonly typeToken: MemberAccessToken | null;
  public readonly valueExpression: Expression;

  public readonly name: string = FillParametersFunctionExpression.functionName;

  public get state(): FillParametersFunctionState | null {
    return this.stateValue;
  }

  public get stateRequired(): FillParametersFunctionState {
    if (this.stateValue == null) throw new Error("State not set.")
    return this.stateValue;
  }

  constructor(valueExpression: Expression, parentReference: NodeReference, source: ExpressionSource) {
    super(parentReference, source);

    this.valueExpression = valueExpression;
    const memberAccessExpression = asMemberAccessExpression(valueExpression);
    this.typeToken = memberAccessExpression ? memberAccessExpression.memberAccessToken : null;
  }

  public getDependencies(componentNodes: IComponentNodeList): Array<IComponentNode> {
    const componentNode = this.typeToken ? componentNodes.getNode(this.typeToken.toString()) : null;
    return componentNode != null ? [componentNode] : [];
  }

  public static create(expression: Expression, parent: NodeReference, source: ExpressionSource): FunctionCallExpression {
    return new FillParametersFunctionExpression(expression, parent, source);
  }

  public override getChildren(): Array<INode> {
    return [this.valueExpression];
  }

  protected override validate(context: IValidationContext): void {
    const valueType = this.valueExpression.deriveType(context);
    const generatedType = asGeneratedType(valueType);
    if (generatedType == null) {
      context.logger.fail(this.reference,
        `Invalid argument 1 'Value' should be of type 'GeneratedType' but is '${valueType}'. ${this.functionHelp}`);
      return;
    }

    const mapping = FillParametersFunctionExpression.getMapping(this.reference, context, generatedType);
    this.stateValue = new FillParametersFunctionState(generatedType, mapping);
  }

  public static getMapping(reference: SourceReference,
                           context: IValidationContext, generatedType: GeneratedType): VariablesMapping {

    const mapping = new Array<Mapping>();
    for (const member of generatedType.members) {
      let variable = context.variableContext.getVariable(member.name);
      if (variable == null) continue;

      if (variable.type == null || !variable.type.equals(member.type)) {
        context.logger.fail(reference,
          `Invalid parameter mapping. Variable '${member.name}' of type '${variable.type}' can't be mapped to parameter '${member.name}' of type '${member.type}'.`);
      } else {
        mapping.push(new Mapping(reference, member.name, variable.type, variable.variableSource));
      }
    }

    if (mapping.length == 0) {
      context.logger.fail(reference,
        `Invalid parameter mapping. No parameter could be mapped from variables.`);
    }

    return new VariablesMapping(generatedType, mapping);
  }

  public override deriveType(context: IValidationContext): Type | null {

    if (this.typeToken == undefined) return null;
    let functionValue = context.componentNodes.getFunction(this.typeToken.parent);
    if (functionValue == null) return null;

    if (this.typeToken.member == Function.parameterName) {
      return functionValue.getParametersType();
    }
    if (this.typeToken.member == Function.resultsName) {
      return functionValue.getResultsType();
    }
    return null;
  }

  public override usedVariables(): ReadonlyArray<VariableUsage> {
    if (!this.stateValue?.mapping) return super.usedVariables();
    return [
      ...super.usedVariables(),
      ...this.stateValue.mapping.values.map(mapToUsedVariable(VariableAccess.Read)),
    ];
  }

  public override getSymbol(): Symbol {
    return new Symbol(this.reference, FillParametersFunctionExpression.functionName, this.functionHelp, SymbolKind.SystemFunction);
  }
}
