import {IHasNodeDependencies} from "../../IHasNodeDependencies";
import {ExpressionFunction} from "./expressionFunction";
import {Expression} from "../expression";
import {MemberAccessLiteral} from "../../../parser/tokens/memberAccessLiteral";
import {SourceReference} from "../../../parser/sourceReference";
import {asMemberAccessExpression} from "../memberAccessExpression";
import {RootNodeList} from "../../rootNodeList";
import {IRootNode} from "../../rootNode";
import {INode} from "../../node";
import {IValidationContext} from "../../../parser/validationContext";
import {VariableType} from "../../variableTypes/variableType";
import {NodeType} from "../../nodeType";
import {asComplexType, ComplexType} from "../../variableTypes/complexType";
import {Assert} from "../../../infrastructure/assert";

export function instanceOfNewFunction(object: any): object is NewFunction {
  return object?.nodeType == NodeType.NewFunction;
}

export function asNewFunction(object: any): NewFunction | null {
  return instanceOfNewFunction(object) ? object as NewFunction : null;
}

export class NewFunction extends ExpressionFunction implements IHasNodeDependencies {

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

  constructor(valueExpression: Expression, reference: SourceReference) {
    super(reference);
    this.valueExpression = valueExpression;

    const memberAccessExpression = asMemberAccessExpression(valueExpression);
    if (memberAccessExpression == null) throw new Error("valueExpression should be MemberAccessExpression");
    this.typeLiteral = memberAccessExpression.memberAccessLiteral;
  }

  public getDependencies(rootNodeList: RootNodeList): Array<IRootNode> {
    let rootNode = this.typeValue ? rootNodeList.getNode(this.typeValue.name) : null;
    return rootNode != null ? [rootNode] : [];
  }

  public static create(reference: SourceReference, expression: Expression): ExpressionFunction {
    return new NewFunction(expression, reference);
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

  public override deriveReturnType(context: IValidationContext): VariableType | null {
    let nodeType = context.rootNodes.getType(this.typeLiteral.parent);
    return nodeType?.memberType(this.typeLiteral.member, context) as ComplexType;
  }
}
