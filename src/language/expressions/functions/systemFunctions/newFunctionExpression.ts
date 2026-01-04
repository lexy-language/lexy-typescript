import type {IComponentNode} from "../../../componentNode";
import type {INode} from "../../../node";
import type {IValidationContext} from "../../../../parser/validationContext";
import type {IHasNodeDependencies} from "../../../IHasNodeDependencies";
import type {IComponentNodeList} from "../../../componentNodeList";

import {Expression} from "../../expression";
import {MemberAccessLiteralToken} from "../../../../parser/tokens/memberAccessLiteralToken";
import {asMemberAccessExpression} from "../../memberAccessExpression";
import {VariableType} from "../../../variableTypes/variableType";
import {NodeType} from "../../../nodeType";
import {asGeneratedType, GeneratedType} from "../../../variableTypes/generatedType";
import {Assert} from "../../../../infrastructure/assert";
import {FunctionCallExpression} from "../functionCallExpression";
import {ExpressionSource} from "../../expressionSource";

export function instanceOfNewFunctionExpression(object: any): object is NewFunctionExpression {
  return object?.nodeType == NodeType.NewFunctionExpression;
}

export function asNewFunctionExpression(object: any): NewFunctionExpression | null {
  return instanceOfNewFunctionExpression(object) ? object as NewFunctionExpression : null;
}

export class NewFunctionExpression extends FunctionCallExpression implements IHasNodeDependencies {

  private typeValue: GeneratedType | null = null;
  private typeLiteralToken: MemberAccessLiteralToken | null;

  public readonly hasNodeDependencies = true;
  public readonly nodeType = NodeType.NewFunctionExpression;

  public static readonly functionName: string = `new`;

  protected get functionHelp() {
    return `${NewFunctionExpression.functionName} expects 1 argument (Function.Parameters)`;
  }

  public valueExpression: Expression;

  public get type(): GeneratedType {
    return Assert.notNull(this.typeValue, "type");
  }

  constructor(valueExpression: Expression, source: ExpressionSource) {
    super(source);
    this.valueExpression = valueExpression;

    const memberAccessExpression = asMemberAccessExpression(valueExpression);
    this.typeLiteralToken = memberAccessExpression ? memberAccessExpression.memberAccessLiteral : null;
  }

  public getDependencies(componentNodes: IComponentNodeList): Array<IComponentNode> {
    let componentNode = this.typeValue ? componentNodes.getNode(this.typeValue.name) : null;
    return componentNode != null ? [componentNode] : [];
  }

  public static create(source: ExpressionSource, expression: Expression): FunctionCallExpression {
    return new NewFunctionExpression(expression, source);
  }

  public override getChildren(): Array<INode> {
    return [this.valueExpression];
  }

  protected override validate(context: IValidationContext): void {
    const valueType = this.valueExpression.deriveType(context);
    const generatedType = asGeneratedType(valueType);
    if (generatedType == null) {
      context.logger.fail(this.reference,
        `Invalid argument 1 'Value' should be of type 'GeneratedTypeType' but is 'ValueType'. ${this.functionHelp}`);
      return;
    }

    this.typeValue = generatedType;
  }

  public override deriveType(context: IValidationContext): VariableType | null {
    if (this.typeLiteralToken == null) return null;
    let nodeType = context.componentNodes.getType(this.typeLiteralToken.parent);
    return nodeType?.memberType(this.typeLiteralToken.member, context.componentNodes) as GeneratedType;
  }
}