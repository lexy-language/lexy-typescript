import type {IValidationContext} from "../../parser/validationContext";

import {INode, Node} from "../node";
import {TableHeader} from "./tableHeader";
import {Expression} from "../expressions/expression";
import {NodeType} from "../nodeType";
import {SourceReference} from "../../parser/sourceReference";

export class TableValue extends Node {

  private readonly index: number;
  private readonly tableHeader: TableHeader;

  public readonly expression: Expression

  public readonly nodeType = NodeType.TableValue;

  constructor(index: number, expression: Expression, tableHeader: TableHeader, reference: SourceReference) {
    super(reference);
    this.expression = expression;
    this.index = index;
    this.tableHeader = tableHeader;
  }

  public override getChildren(): Array<INode> {
    return [this.expression];
  }

  protected override validate(context: IValidationContext): void {
    const column = this.tableHeader.getColumnByIndex(this.index);
    if (column == null) return;
    const actualType = this.expression.deriveType(context);
    const expectedType = column.type.variableType;
    if (expectedType?.equals(actualType) != true) {
      context.logger.fail(this.reference, `Invalid value type '${actualType}'. Expected '${expectedType}'.`);
    }
  }

}