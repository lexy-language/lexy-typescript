import type {IValidationContext} from "../../parser/context/validationContext";

import {INode, Node} from "../node";
import {Expression} from "../expressions/expression";
import {NodeType} from "../nodeType";
import {SourceReference} from "../sourceReference";
import {asLiteralExpression} from "../expressions/literalExpression";
import {ValidationTableHeader} from "./validationTableHeader";
import {asMemberAccessToken} from "../../parser/tokens/memberAccessToken";
import {asMemberAccessExpression} from "../expressions/memberAccessExpression";
import {NodeReference} from "../nodeReference";
import {Symbol} from "../symbols/symbol";

export class ValidationTableValue extends Node {

  public readonly expression: Expression

  public readonly nodeType = NodeType.ValidationTableValue;

  constructor(expression: Expression, parentReference: NodeReference, reference: SourceReference) {
    super(parentReference, reference);
    this.expression = expression;
  }

  public override getChildren(): Array<INode> {
    return [this.expression];
  }

  protected override validate(context: IValidationContext): void {
  }

  public getValue(): any | null {
    const memberAccessExpression = asMemberAccessExpression(this.expression);
    if (memberAccessExpression != null) {
      return memberAccessExpression.identifierPath.toString();
    }

    const literal = asLiteralExpression(this.expression);
    const value = literal?.literal.typedValue;
    return value == undefined ? null : value;
  }

  public override getSymbol(): Symbol | null {
    return null;
  }
}
