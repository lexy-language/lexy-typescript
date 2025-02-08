import type {IValidationContext} from "../../parser/validationContext";

import {INode, Node} from "../node";
import {SourceReference} from "../../parser/sourceReference";
import {IParseLineContext} from "../../parser/ParseLineContext";
import {TableSeparatorToken} from "../../parser/tokens/tableSeparatorToken";
import {NodeType} from "../nodeType";
import {TokenType} from "../../parser/tokens/tokenType";
import {ValidationColumnHeader} from "./validationColumnHeader";

export class ValidationTableHeader extends Node {

  private readonly columnsValue: Array<ValidationColumnHeader>;

  public readonly nodeType = NodeType.ValidationTableHeader;

  public get columns(): ReadonlyArray<ValidationColumnHeader> {
    return this.columnsValue;
  }

  constructor(columns: ValidationColumnHeader[], reference: SourceReference) {
    super(reference);
    this.columnsValue = columns;
  }

  public static parse(context: IParseLineContext): ValidationTableHeader | null {

    let startsWithTableSeparator = context.validateTokens("ValidationTableHeader")
      .type<TableSeparatorToken>(0, TokenType.TableSeparatorToken)
      .isValid;

    if (!startsWithTableSeparator) return null;

    return ValidationTableHeader.parseWithoutColumnType(context);
  }

  public static parseWithoutColumnType(context: IParseLineContext): ValidationTableHeader | null {
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
      const reference = context.line.tokenReference(index++);

      if (name == null) return null;

      const header = ValidationColumnHeader.parse(name, reference);
      headers.push(header);
    }

    return new ValidationTableHeader(headers, context.line.lineStartReference());
  }

  public override getChildren(): Array<INode> {
    return [...this.columnsValue];
  }

  protected override validate(context: IValidationContext): void {
  }

  public getColumnByIndex(index: number): ValidationColumnHeader | null {
    return index >= 0 && index < this.columns.length ? this.columns[index] : null;
  }
}
