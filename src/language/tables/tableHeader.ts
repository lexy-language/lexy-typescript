import type {IValidationContext} from "../../parser/context/validationContext";

import {INode, Node} from "../node";
import {ColumnHeader} from "./columnHeader";
import {SourceReference} from "../sourceReference";
import {IParseLineContext} from "../../parser/context/parseLineContext";
import {TableSeparatorToken} from "../../parser/tokens/tableSeparatorToken";
import {firstOrDefault} from "../../infrastructure/arrayFunctions";
import {NodeType} from "../nodeType";
import {TokenType} from "../../parser/tokens/tokenType";
import {IdentifierPath} from "../identifierPath";
import {Table} from "./table";
import {NodeReference} from "../nodeReference";
import {Symbol} from "../symbols/symbol";

export class TableHeader extends Node {

  private readonly columnsValue: Array<ColumnHeader>;

  public readonly nodeType = NodeType.TableHeader;

  public get columns(): ReadonlyArray<ColumnHeader> {
    return this.columnsValue;
  }

  constructor(columns: ColumnHeader[], table: Table, reference: SourceReference) {
    super(table, reference);
    this.columnsValue = columns;
  }

  public static parse(context: IParseLineContext, table: Table): TableHeader | null {

    const startsWithTableSeparator = context.validateTokens("TableHeader")
      .type<TableSeparatorToken>(0, TokenType.TableSeparatorToken)
      .isValid;

    if (!startsWithTableSeparator) return null;

    return TableHeader.parseWithColumnType(context, table);
  }

  private static parseWithColumnType(context: IParseLineContext, table: Table): TableHeader | null {

    const headerReference = new NodeReference();
    const headers = new Array<ColumnHeader>();
    const tokens = context.line.tokens;
    let index = 1;
    while (index < tokens.length) {

      const header = ColumnHeader.parse(context, headerReference, index);
      if (header == null) return null;

      headers.push(header);

      index += 3;
    }

    let tableHeader = new TableHeader(headers, table, context.line.tokens.allReference());
    headerReference.setNode(tableHeader);
    return tableHeader;
  }

  public override getChildren(): Array<INode> {
    return [...this.columnsValue];
  }

  protected override validate(context: IValidationContext): void {
  }

  public get(identifierPath: IdentifierPath): ColumnHeader | null {
    if (identifierPath.parts < 2) return null;
    let name = identifierPath.path[1];
    return this.getColumn(name);
  }

  public getColumnByIndex(index: number): ColumnHeader | null {
    return index >= 0 && index < this.columns.length ? this.columns[index] : null;
  }

  public getColumn(name: string): ColumnHeader | null {
    return firstOrDefault(this.columnsValue, value => value.name == name);
  }

  public override getSymbol(): Symbol | null {
    return null;
  }
}
