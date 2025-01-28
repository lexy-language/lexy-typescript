import type {IValidationContext} from "../../parser/validationContext";
import type {IParseLineContext} from "../../parser/ParseLineContext";
import type {INode} from "../node";
import {Node} from "../node";
import {SourceReference} from "../../parser/sourceReference";
import {TableSeparatorToken} from "../../parser/tokens/tableSeparatorToken";
import {asToken, Token} from "../../parser/tokens/token";
import {TokenList} from "../../parser/tokens/tokenList";
import {NodeType} from "../nodeType";
import {TokenType} from "../../parser/tokens/tokenType";
import {TableHeader} from "./tableHeader";
import {TableValue} from "./tableValue";

export class TableRow extends Node {

  private readonly valuesValue: Array<TableValue>;
  private readonly tableHeader: TableHeader;

  public readonly nodeType = NodeType.TableRow;

  public get values(): ReadonlyArray<TableValue> {
    return this.valuesValue;
  }

  constructor(tableHeader: TableHeader, values: TableValue[], reference: SourceReference) {
    super(reference);
    this.valuesValue = values;
    this.tableHeader = tableHeader;
  }

  public static parse(context: IParseLineContext, tableHeader: TableHeader): TableRow | null {
    let tokenIndex = 0;

    if (!context.validateTokens("TableRow")
      .type<TableSeparatorToken>(tokenIndex, TokenType.TableSeparatorToken)
      .isValid) {
      return null;
    }

    let values = new Array<TableValue>();
    let currentLineTokens = context.line.tokens;
    while (++tokenIndex < currentLineTokens.length) {
      const value = TableRow.parseValue(context, tableHeader, currentLineTokens, tokenIndex++, values.length);
      if (value == null) {
        return null;
      }
      values.push(value);
    }

    return new TableRow(tableHeader, values, context.line.lineStartReference());
  }

  private static parseValue(context: IParseLineContext, tableHeader: TableHeader, currentLineTokens: TokenList, tokenIndex: number, valueIndex: number) {
    let notValid = !context.validateTokens("TableRow")
      .isLiteralToken(tokenIndex)
      .type<TableSeparatorToken>(tokenIndex + 1, TokenType.TableSeparatorToken)
      .isValid;

    if (notValid) return null;

    var reference = context.line.tokenReference(tokenIndex);
    let token = currentLineTokens.token<Token>(tokenIndex++, asToken);
    if (token == null) return null;

    let expression = context.expressionFactory.parse(new TokenList([token]), context.line);
    if (expression.state == "failed") {
      context.logger.fail(reference, expression.errorMessage);
      return null;
    }

    return new TableValue(valueIndex, expression.result, tableHeader, reference);
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
}

