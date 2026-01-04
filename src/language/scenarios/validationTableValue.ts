import type {IValidationContext} from "../../parser/validationContext";

import {INode, Node} from "../node";
import {Expression} from "../expressions/expression";
import {NodeType} from "../nodeType";
import {SourceReference} from "../../parser/sourceReference";
import {asLiteralExpression} from "../expressions/literalExpression";
import {ValidationTableHeader} from "./validationTableHeader";
import {asMemberAccessLiteralToken} from "../../parser/tokens/memberAccessLiteralToken";
import {asMemberAccessExpression} from "../expressions/memberAccessExpression";

export class ValidationTableValue extends Node {

  private readonly index: number;
  private readonly tableHeader: ValidationTableHeader;

  public readonly expression: Expression

  public readonly nodeType = NodeType.ValidationTableValue;

  constructor(index: number, expression: Expression, tableHeader: ValidationTableHeader, reference: SourceReference) {
    super(reference);
    this.expression = expression;
    this.index = index;
    this.tableHeader = tableHeader;
  }

  public override getChildren(): Array<INode> {
    return [this.expression];
  }

  protected override validate(context: IValidationContext): void {
  }

  public getValue(): any | null {
    const enumValue = asMemberAccessExpression(this.expression);
    if (enumValue != null) {
      return enumValue.toString();
    }

    const literal = asLiteralExpression(this.expression);
    const value = literal?.literal.typedValue;
    return value == undefined ? null : value;
  }
}