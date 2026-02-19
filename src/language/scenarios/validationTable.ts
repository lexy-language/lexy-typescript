import type {IParseLineContext} from "../../parser/context/parseLineContext";
import type {IParsableNode} from "../parsableNode";
import type {INode} from "../node";
import type {IValidationContext} from "../../parser/context/validationContext";

import {SourceReference} from "../sourceReference";
import {NodeType} from "../nodeType";
import {ValidationTableRow} from "./validationTableRow";
import {ValidationTableHeader} from "./validationTableHeader";
import {ParsableNode} from "../parsableNode";
import {INodeWithName} from "../nodeWithName";
import {NodeReference} from "../nodeReference";
import {Scenario} from "./scenario";
import {Symbol} from "../symbols/symbol";

export class ValidationTable extends ParsableNode implements INodeWithName {

  private invalidHeader: boolean = false;

  private rowsValue: Array<ValidationTableRow> = [];
  private headerValue: ValidationTableHeader | null = null;

  public readonly isNodeWithName = true;
  public readonly nodeType = NodeType.ValidationTable;
  public readonly name: string;

  public get header(): ValidationTableHeader | null {
    return this.headerValue;
  }

  get rows(): Array<ValidationTableRow> {
    return this.rowsValue;
  }

  constructor(name: string, parent: Scenario, reference: SourceReference) {
    super(new NodeReference(parent), reference);
    this.name = name;
  }

  public override parse(context: IParseLineContext): IParsableNode {
    if (this.invalidHeader) return this;

    if (this.headerValue == null) {
      this.headerValue = ValidationTableHeader.parse(context, this);
      if (this.headerValue == null){
        this.invalidHeader = true;
      }
      return this;
    }

    const tableRow = ValidationTableRow.parse(context, this.rows.length, this.headerValue, this);
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
      context.logger.fail(this.reference, "No table header found.");
    }
  }

  public override validateTree(context: IValidationContext): void {
    context.inNodeVariableScope(this, super.validateTree.bind(this));
  }

  public override getSymbol(): Symbol | null {
    return null;
  }

  public override toString(): string {
    return this.rows.length.toString();
  }
}
