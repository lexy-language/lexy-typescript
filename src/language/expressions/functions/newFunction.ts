import type {IComponentNode} from "../../componentNode";
import type {INode} from "../../node";
import type {IValidationContext} from "../../../parser/validationContext";
import type {IHasNodeDependencies} from "../../IHasNodeDependencies";
import type {IComponentNodeList} from "../../componentNodeList";

import {Expression} from "../expression";
import {MemberAccessLiteral} from "../../../parser/tokens/memberAccessLiteral";
import {asMemberAccessExpression} from "../memberAccessExpression";
import {VariableType} from "../../variableTypes/variableType";
import {NodeType} from "../../nodeType";
import {asComplexType, ComplexType} from "../../variableTypes/complexType";
import {Assert} from "../../../infrastructure/assert";
import {FunctionCallExpression} from "./functionCallExpression";
import {ExpressionSource} from "../expressionSource";

export function instanceOfNewFunction(object: any): object is NewFunction {
  return object?.nodeType == NodeType.NewFunction;
}

export function asNewFunction(object: any): NewFunction | null {
  return instanceOfNewFunction(object) ? object as NewFunction : null;
}

export class NewFunction extends FunctionCallExpression implements IHasNodeDependencies {

  private typeValue: ComplexType | null = null;

  public readonly hasNodeDependencies = true;
  public readonly nodeType = NodeType.NewFunction;

  public static readonly functionName: string = `new`;

  protected get functionHelp() {
    return `${NewFunction.functionName} expects 1 argument (Function.Parameters)`;
  }

  public typeLiteral: MemberAccessLiteral;

  public valueExpression: Expression;

  public get type(): ComplexType {
    return Assert.notNull(this.typeValue, "type");
  }

  constructor(valueExpression: Expression, source: ExpressionSource) {
    super(NewFunction.functionName, source);
    this.valueExpression = valueExpression;

    const memberAccessExpression = asMemberAccessExpression(valueExpression);
    if (memberAccessExpression == null) throw new Error("valueExpression should be MemberAccessExpression");
    this.typeLiteral = memberAccessExpression.memberAccessLiteral;
  }

  public getDependencies(componentNodeList: IComponentNodeList): Array<IComponentNode> {
    let componentNode = this.typeValue ? componentNodeList.getNode(this.typeValue.name) : null;
    return componentNode != null ? [componentNode] : [];
  }

  public static create(source: ExpressionSource, expression: Expression): FunctionCallExpression {
    return new NewFunction(expression, source);
  }

  public override getChildren(): Array<INode> {
    return [this.valueExpression];
  }

  protected override validate(context: IValidationContext): void {
    const valueType = this.valueExpression.deriveType(context);
    const complexType = asComplexType(valueType);
    if (complexType == null) {
      context.logger.fail(this.reference,
        `Invalid argument 1 'Value' should be of type 'ComplexTypeType' but is 'ValueType'. ${this.functionHelp}`);
      return;
    }

    this.typeValue = complexType;
  }

  public override deriveType(context: IValidationContext): VariableType | null {
    let nodeType = context.componentNodes.getType(this.typeLiteral.parent);
    return nodeType?.memberType(this.typeLiteral.member, context.componentNodes) as ComplexType;
  }
}
