import type {IValidationContext} from "../../parser/context/validationContext";
import type {IParseLineContext} from "../../parser/context/parseLineContext";
import type {INode} from "../node";

import {Node} from "../node";
import {SourceReference} from "../sourceReference";
import {TableSeparatorToken} from "../../parser/tokens/tableSeparatorToken";
import {NodeType} from "../nodeType";
import {TokenType} from "../../parser/tokens/tokenType";
import {TableHeader} from "./tableHeader";
import {TableValue} from "./tableValue";
import {Table} from "./table";
import {Assert} from "../../infrastructure/assert";
import {NodeReference} from "../nodeReference";
import {Symbol} from "../symbols/symbol";

export class TableRow extends Node {

  private readonly valuesValue: Array<TableValue>;
  private readonly tableHeader: TableHeader;

  public readonly nodeType = NodeType.TableRow;

  public get values(): ReadonlyArray<TableValue> {
    return this.valuesValue;
  }

  constructor(table: Table, values: TableValue[], reference: SourceReference) {
    super(table, reference);
    this.valuesValue = Assert.notNull(values, "values");
    this.tableHeader = Assert.notNull(table.header, "header");
  }

  public static parse(context: IParseLineContext, tableHeader: TableHeader, table: Table): TableRow | null {
    let tokenIndex = 0;

    if (!context.validateTokens("TableRow")
      .type<TableSeparatorToken>(tokenIndex, TokenType.TableSeparatorToken)
      .isValid) {
      return null;
    }

    const rowReference = new NodeReference();
    const values = new Array<TableValue>();
    const currentLineTokens = context.line.tokens;
    while (++tokenIndex < currentLineTokens.length) {
      const value = TableValue.parse(context, tableHeader, currentLineTokens, rowReference, tokenIndex++, values.length);
      if (value == null) {
        return null;
      }
      values.push(value);
    }

    const tableRow = new TableRow(table, values, context.line.tokens.allReference());
    rowReference.setNode(tableRow);
    return tableRow;
  }

  public override getChildren(): Array<INode> {
    return [...this.values];
  }

  protected override validate(context: IValidationContext): void {
    if (this.tableHeader.columns.length != this.values.length) {
      context.logger.fail(this.reference,
        `Invalid number of values ${this.values.length}. Expected ${this.tableHeader.columns.length}.`);
    }
  }

  public override getSymbol(): Symbol | null {
    return null;
  }
}

