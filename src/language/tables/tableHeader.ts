import type {IValidationContext} from "../../parser/validationContext";

import {INode, Node} from "../node";
import {ColumnHeader} from "./columnHeader";
import {SourceReference} from "../../parser/sourceReference";
import {IParseLineContext} from "../../parser/ParseLineContext";
import {TableSeparatorToken} from "../../parser/tokens/tableSeparatorToken";
import {StringLiteralToken} from "../../parser/tokens/stringLiteralToken";
import {MemberAccessLiteralToken} from "../../parser/tokens/memberAccessLiteralToken";
import {firstOrDefault} from "../../infrastructure/arrayFunctions";
import {NodeType} from "../nodeType";
import {TokenType} from "../../parser/tokens/tokenType";
import {IdentifierPath} from "../identifierPath";

export class TableHeader extends Node {

  private readonly columnsValue: Array<ColumnHeader>;

  public readonly nodeType = NodeType.TableHeader;

  public get columns(): ReadonlyArray<ColumnHeader> {
    return this.columnsValue;
  }

  constructor(columns: ColumnHeader[], reference: SourceReference) {
    super(reference);
    this.columnsValue = columns;
  }

  public static parse(context: IParseLineContext): TableHeader | null {

    let startsWithTableSeparator = context.validateTokens("TableHeader")
      .type<TableSeparatorToken>(0, TokenType.TableSeparatorToken)
      .isValid;

    if (!startsWithTableSeparator) return null;

    return TableHeader.parseWithColumnType(context);
  }

  private static parseWithColumnType(context: IParseLineContext): TableHeader | null {
    let index = 0;
    let headers = new Array<ColumnHeader>();
    let tokens = context.line.tokens;
    while (++index < tokens.length) {
      if (!context.validateTokens("TableHeader")
        .type<StringLiteralToken>(index, TokenType.StringLiteralToken)
        .type<StringLiteralToken>(index + 1, TokenType.StringLiteralToken)
        .type<TableSeparatorToken>(index + 2, TokenType.TableSeparatorToken)
        .isValid) {
        return null;
      }

      let typeName = tokens.tokenValue(index)
      let name = tokens.tokenValue(++index);
      let reference = context.line.tokenReference(index);

      if (typeName == null || name == null) return null;

      let header = ColumnHeader.parse(name, typeName, reference);
      headers.push(header);

      ++index;
    }

    return new TableHeader(headers, context.line.lineStartReference());
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
}
