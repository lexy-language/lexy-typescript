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
import {ValidationTableValue} from "./validationTableValue";
import {ValidationTableHeader} from "./validationTableHeader";

export class ValidationTableRow extends Node {

  private readonly valuesValue: Array<ValidationTableValue>;
  private readonly tableHeader: ValidationTableHeader;

  public readonly nodeType = NodeType.ValidationTableRow;

  public readonly index: number;

  public get values(): ReadonlyArray<ValidationTableValue> {
    return this.valuesValue;
  }

  constructor(index: number, tableHeader: ValidationTableHeader, values: ValidationTableValue[], reference: SourceReference) {
    super(reference);
    this.valuesValue = values;
    this.tableHeader = tableHeader;
    this.index = index;
  }

  public static parse(context: IParseLineContext, index: number, tableHeader: ValidationTableHeader): ValidationTableRow | null {
    let tokenIndex = 0;

    if (!context.validateTokens("TableRow")
      .type<TableSeparatorToken>(tokenIndex, TokenType.TableSeparatorToken)
      .isValid) {
      return null;
    }

    let values = new Array<ValidationTableValue>();
    let currentLineTokens = context.line.tokens;
    while (++tokenIndex < currentLineTokens.length) {
      const value = ValidationTableRow.parseValue(context, tableHeader, currentLineTokens, tokenIndex++, values.length);
      if (value == null) {
        return null;
      }
      values.push(value);
    }

    return new ValidationTableRow(index, tableHeader, values, context.line.lineStartReference());
  }

  private static parseValue(context: IParseLineContext, tableHeader: ValidationTableHeader, currentLineTokens: TokenList, tokenIndex: number, valueIndex: number) {
    const notValid = !context.validateTokens("ValidationTableRow")
      .isLiteralToken(tokenIndex)
      .type<TableSeparatorToken>(tokenIndex + 1, TokenType.TableSeparatorToken)
      .isValid;

    if (notValid) return null;

    const reference = context.line.tokenReference(tokenIndex);
    const token = currentLineTokens.token<Token>(tokenIndex++, asToken);
    if (token == null) return null;

    let expression = context.expressionFactory.parse(new TokenList([token]), context.line);
    if (expression.state == "failed") {
      context.logger.fail(reference, expression.errorMessage);
      return null;
    }

    return new ValidationTableValue(valueIndex, expression.result, tableHeader, reference);
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

