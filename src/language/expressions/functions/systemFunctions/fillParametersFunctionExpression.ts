import type {IComponentNode} from "../../../componentNode";
import type {INode} from "../../../node";
import type {IValidationContext} from "../../../../parser/validationContext";
import type {IHasNodeDependencies} from "../../../IHasNodeDependencies";
import type {IComponentNodeList} from "../../../componentNodeList";

import {Mapping, mapToUsedVariable} from "../mapping";
import {MemberAccessLiteralToken} from "../../../../parser/tokens/memberAccessLiteralToken";
import {Expression} from "../../expression";
import {SourceReference} from "../../../../parser/sourceReference";
import {asMemberAccessExpression} from "../../memberAccessExpression";
import {asGeneratedType, GeneratedType} from "../../../variableTypes/generatedType";
import {VariableType} from "../../../variableTypes/variableType";
import {Function} from "../../../functions/function";
import {NodeType} from "../../../nodeType";
import {Assert} from "../../../../infrastructure/assert";
import {VariableUsage} from "../../variableUsage";
import {VariableAccess} from "../../variableAccess";
import {FunctionCallExpression} from "../functionCallExpression";
import {ExpressionSource} from "../../expressionSource";

export function instanceOfFillParametersFunctionExpression(object: any): object is FillParametersFunctionExpression {
  return object?.nodeType == NodeType.FillParametersFunctionExpression;
}

export function asFillParametersFunctionExpression(object: any): FillParametersFunctionExpression | null {
  return instanceOfFillParametersFunctionExpression(object) ? object as FillParametersFunctionExpression : null;
}

export class FillParametersFunctionExpression extends FunctionCallExpression implements IHasNodeDependencies {

  public static readonly functionName: string = `fill`;

  private typeValue: GeneratedType | null = null;

  public readonly hasNodeDependencies = true;
  public readonly nodeType = NodeType.FillParametersFunctionExpression;

  public readonly typeLiteralToken: MemberAccessLiteralToken | null;
  public readonly valueExpression: Expression;

  public get type() {
    return Assert.notNull(this.typeValue, "type");
  }

  public readonly mapping: Array<Mapping> = [];

  private get functionHelp() {
    return `${FillParametersFunctionExpression.functionName} expects 1 argument (Function.Parameters)`;
  }

  constructor(valueExpression: Expression, source: ExpressionSource) {
    super(source);
    this.valueExpression = valueExpression;

    const memberAccessExpression = asMemberAccessExpression(valueExpression);
    this.typeLiteralToken = memberAccessExpression ? memberAccessExpression.memberAccessLiteral : null;
  }

  public getDependencies(componentNodes: IComponentNodeList): Array<IComponentNode> {
    const componentNode = this.typeLiteralToken ? componentNodes.getNode(this.typeLiteralToken.toString()) : null;
    return componentNode != null ? [componentNode] : [];
  }

  public static create(source: ExpressionSource, expression: Expression): FunctionCallExpression {
    return new FillParametersFunctionExpression(expression, source);
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

    this.typeValue = generatedType;

    FillParametersFunctionExpression.getMapping(this.reference, context, generatedType, this.mapping);
  }

  public static getMapping(reference: SourceReference, context: IValidationContext, generatedType: GeneratedType,
                           mapping: Array<Mapping>): void {

    for (const member of generatedType.members) {
      let variable = context.variableContext.getVariable(member.name);
      if (variable == null) continue;

      if (variable.variableType == null || !variable.variableType.equals(member.type)) {
        context.logger.fail(reference,
          `Invalid parameter mapping. Variable '${member.name}' of type '${variable.variableType}' can't be mapped to parameter '${member.name}' of type '${member.type}'.`);
      } else {
        mapping.push(new Mapping(member.name, variable.variableType, variable.variableSource));
      }
    }

    if (mapping.length == 0) {
      context.logger.fail(reference,
        `Invalid parameter mapping. No parameter could be mapped from variables.`);
    }
  }

  public override deriveType(context: IValidationContext): VariableType | null {

    if (this.typeLiteralToken == undefined) return null;
    let functionValue = context.componentNodes.getFunction(this.typeLiteralToken.parent);
    if (functionValue == null) return null;

    if (this.typeLiteralToken.member == Function.parameterName) {
      return functionValue.getParametersType();
    }
    if (this.typeLiteralToken.member == Function.resultsName) {
      return functionValue.getResultsType();
    }
    return null;
  }

  public override usedVariables(): ReadonlyArray<VariableUsage> {
    return [
      ...super.usedVariables(),
      ...this.mapping.map(mapToUsedVariable(VariableAccess.Read)),
    ];
  }
}
