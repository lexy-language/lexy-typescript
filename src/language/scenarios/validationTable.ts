import type {IParseLineContext} from "../../parser/ParseLineContext";
import type {IParsableNode} from "../parsableNode";
import type {INode} from "../node";
import type {IValidationContext} from "../../parser/validationContext";

import {SourceReference} from "../../parser/sourceReference";
import {NodeType} from "../nodeType";
import {ValidationTableRow} from "./validationTableRow";
import {ValidationTableName} from "./validationTableName";
import {ValidationTableHeader} from "./validationTableHeader";
import {ParsableNode} from "../parsableNode";

export class ValidationTable extends ParsableNode {

  private invalidHeader: boolean = false;

  private rowsValue: Array<ValidationTableRow> = [];
  private headerValue: ValidationTableHeader | null = null;

  public readonly nodeType = NodeType.ValidationTable;
  public readonly name: ValidationTableName = new ValidationTableName();

  public get header(): ValidationTableHeader | null {
    return this.headerValue;
  }

  get rows(): Array<ValidationTableRow> {
    return this.rowsValue;
  }

  constructor(name: string, reference: SourceReference) {
    super(reference);
    this.name.parseName(name);
  }

  public override parse(context: IParseLineContext): IParsableNode {
    if (this.invalidHeader) return this;

    if (this.headerValue == null) {
      this.headerValue = ValidationTableHeader.parse(context);
      if (this.headerValue == null){
        this.invalidHeader = true;
      }
      return this;
    }

    const tableRow = ValidationTableRow.parse(context, this.rows.length, this.headerValue);
    if (tableRow != null) {
      this.rows.push(tableRow);
    }
    return this;
  }

  public override getChildren(): Array<INode> {
    if (this.header != null) {
      return [this.header, ...this.rows];
    } else {
      return [...this.rows];
    }
  }

  protected override validate(context: IValidationContext): void {
    if (this.header == null) {
      context.logger.fail(this.reference, "No tableName header found.");
    }
  }

  public override validateTree(context: IValidationContext): void {
    const scope = context.createVariableScope();
    try {
      super.validateTree(context);
    } finally {
      scope[Symbol.dispose]();
    }
  }
}
