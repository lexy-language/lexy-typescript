import type {IValidationContext} from "../../parser/context/validationContext";

import {INode, Node} from "../node";
import {SourceReference} from "../sourceReference";
import {IParseLineContext} from "../../parser/context/parseLineContext";
import {TableSeparatorToken} from "../../parser/tokens/tableSeparatorToken";
import {NodeType} from "../nodeType";
import {TokenType} from "../../parser/tokens/tokenType";
import {ValidationColumnHeader} from "./validationColumnHeader";
import {ValidationTable} from "./validationTable";
import {NodeReference} from "../nodeReference";
import {Symbol} from "../symbols/symbol";

export class ValidationTableHeader extends Node {

  private readonly columnsValue: Array<ValidationColumnHeader>;

  public readonly nodeType = NodeType.ValidationTableHeader;

  public get columns(): ReadonlyArray<ValidationColumnHeader> {
    return this.columnsValue;
  }

  constructor(columns: ValidationColumnHeader[], parent: ValidationTable, reference: SourceReference) {
    super(new NodeReference(parent), reference);
    this.columnsValue = columns;
  }

  public static parse(context: IParseLineContext, validationTable: ValidationTable): ValidationTableHeader | null {

    let startsWithTableSeparator = context.validateTokens("ValidationTableHeader")
      .type<TableSeparatorToken>(0, TokenType.TableSeparatorToken)
      .isValid;

    if (!startsWithTableSeparator) return null;

    return ValidationTableHeader.parseWithoutColumnType(context, validationTable);
  }

  public static parseWithoutColumnType(context: IParseLineContext, validationTable: ValidationTable): ValidationTableHeader | null {
    let headerReference = new NodeReference();
    let index = 0;
    let headers = new Array<ValidationColumnHeader>();
    let tokens = context.line.tokens;
    while (++index < tokens.length) {
      if (!context.validateTokens("ValidationTableHeader")
        .type<TableSeparatorToken>(index + 1, TokenType.TableSeparatorToken)
        .isValid) {
        return null;
      }

      const name = tokens.tokenValue(index);
      const reference = context.line.tokens.reference(index++, 1);

      if (name == null) return null;

      const header = ValidationColumnHeader.parse(name, headerReference, reference);
      headers.push(header);
    }

    let validationTableHeader = new ValidationTableHeader(headers, validationTable, context.line.tokens.allReference());
    headerReference.setNode(validationTableHeader);
    return validationTableHeader;
  }

  public override getChildren(): Array<INode> {
    return [...this.columnsValue];
  }

  protected override validate(context: IValidationContext): void {
  }

  public getColumnByIndex(index: number): ValidationColumnHeader | null {
    return index >= 0 && index < this.columns.length ? this.columns[index] : null;
  }

  public override getSymbol(): Symbol | null {
    return null;
  }

  public override toString(): string {
    return this.columnsValue.length.toString();
  }
}
