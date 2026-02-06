import type {IComponentNode} from "../../../componentNode";
import type {INode} from "../../../node";
import type {IValidationContext} from "../../../../parser/context/validationContext";
import type {IHasNodeDependencies} from "../../../IHasNodeDependencies";
import type {IComponentNodeList} from "../../../componentNodeList";

import {Expression} from "../../expression";
import {MemberAccessToken} from "../../../../parser/tokens/memberAccessToken";
import {asMemberAccessExpression} from "../../memberAccessExpression";
import {Type} from "../../../typeSystem/type";
import {NodeType} from "../../../nodeType";
import {asGeneratedType, GeneratedType} from "../../../typeSystem/objects/generatedType";
import {FunctionCallExpression} from "../functionCallExpression";
import {ExpressionSource} from "../../expressionSource";
import {SymbolKind} from "../../../symbols/symbolKind";
import {Symbol} from "../../../symbols/symbol";
import {NodeReference} from "../../../nodeReference";

export function instanceOfNewFunctionExpression(object: any): object is NewFunctionExpression {
  return object?.nodeType == NodeType.NewFunctionExpression;
}

export function asNewFunctionExpression(object: any): NewFunctionExpression | null {
  return instanceOfNewFunctionExpression(object) ? object as NewFunctionExpression : null;
}

export class NewFunctionState {

  public type: GeneratedType;

  constructor(type: GeneratedType) {
    this.type = type;
  }
}

export class NewFunctionExpression extends FunctionCallExpression implements IHasNodeDependencies {

  public static readonly functionName: string = `new`;

  private readonly typeToken: MemberAccessToken | null;

  private stateValue: NewFunctionState | null = null;

  public readonly hasNodeDependencies = true;
  public readonly nodeType = NodeType.NewFunctionExpression;

  public readonly name: string = NewFunctionExpression.functionName;

  protected get functionHelp() {
    return `${NewFunctionExpression.functionName} expects 1 argument (Function.Parameters)`;
  }

  public valueExpression: Expression;

  public get state(): NewFunctionState | null {
    return this.stateValue;
  }

  constructor(valueExpression: Expression, parentReference: NodeReference, source: ExpressionSource) {
    super(parentReference, source);
    this.valueExpression = valueExpression;

    const memberAccessExpression = asMemberAccessExpression(valueExpression);
    this.typeToken = memberAccessExpression ? memberAccessExpression.memberAccessToken : null;
  }

  public getDependencies(componentNodes: IComponentNodeList): Array<IComponentNode> {
    let componentNode = this.state?.type ? componentNodes.getNode(this.state.type.name) : null;
    return componentNode != null ? [componentNode] : [];
  }

  public static create(expression: Expression, parent: NodeReference, source: ExpressionSource): FunctionCallExpression {
    return new NewFunctionExpression(expression, parent, source);
  }

  public override getChildren(): Array<INode> {
    return [this.valueExpression];
  }

  protected override validate(context: IValidationContext): void {
    const valueType = this.valueExpression.deriveType(context);
    const generatedType = asGeneratedType(valueType);
    if (generatedType == null) {
      context.logger.fail(this.reference,
        `Invalid argument 1 'Value' should be of type 'GeneratedType' but is '${valueType?.typeKind}'. ${this.functionHelp}`);
      return;
    }
    this.stateValue = new NewFunctionState(generatedType);
  }

  public override deriveType(context: IValidationContext): Type | null {
    if (this.typeToken == null) return null;
    let nodeType = context.componentNodes.getType(this.typeToken.parent);
    return nodeType?.memberType(this.typeToken.member) as GeneratedType;
  }

  public override getSymbol(): Symbol {
    return new Symbol(this.reference, NewFunctionExpression.functionName, this.functionHelp, SymbolKind.SystemFunction);
  }
}
