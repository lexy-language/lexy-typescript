import type {IValidationContext} from "../../parser/context/validationContext";
import type {IParseLineContext} from "../../parser/context/parseLineContext";
import type {INode} from "../node";

import {Node} from "../node";
import {SourceReference} from "../sourceReference";
import {TableSeparatorToken} from "../../parser/tokens/tableSeparatorToken";
import {asToken, Token} from "../../parser/tokens/token";
import {TokenList} from "../../parser/tokens/tokenList";
import {NodeType} from "../nodeType";
import {TokenType} from "../../parser/tokens/tokenType";
import {ValidationTableValue} from "./validationTableValue";
import {ValidationTableHeader} from "./validationTableHeader";
import {NodeReference} from "../nodeReference";
import {ValidationTable} from "./validationTable";
import {Symbol} from "../symbols/symbol";

export class ValidationTableRow extends Node {

  private readonly valuesValue: Array<ValidationTableValue>;
  private readonly tableHeader: ValidationTableHeader;

  public readonly nodeType = NodeType.ValidationTableRow;

  public readonly index: number;

  public get values(): ReadonlyArray<ValidationTableValue> {
    return this.valuesValue;
  }

  constructor(index: number, tableHeader: ValidationTableHeader,
              values: ValidationTableValue[],
              validationTable: ValidationTable,
              reference: SourceReference) {
    super(new NodeReference(validationTable), reference);
    this.valuesValue = values;
    this.tableHeader = tableHeader;
    this.index = index;
  }

  public static parse(context: IParseLineContext, index: number, tableHeader:
                      ValidationTableHeader, validationTable: ValidationTable): ValidationTableRow | null {
    let tokenIndex = 0;

    if (!context.validateTokens("TableRow")
      .type<TableSeparatorToken>(tokenIndex, TokenType.TableSeparatorToken)
      .isValid) {
      return null;
    }

    const tableRowReference = new NodeReference();
    let values = new Array<ValidationTableValue>();
    let currentLineTokens = context.line.tokens;
    while (++tokenIndex < currentLineTokens.length) {
      const value = this.parseValue(context, tableRowReference, currentLineTokens, tokenIndex++);
      if (value == null) {
        return null;
      }
      values.push(value);
    }

    const validationTableRow = new ValidationTableRow(index, tableHeader, values, validationTable, context.line.tokens.allReference());
    tableRowReference.setNode(validationTableRow);

    return validationTableRow;
  }

  private static parseValue(context: IParseLineContext,
                            tableRowReference: NodeReference,
                            currentLineTokens: TokenList, tokenIndex: number) {
    const notValid = !context.validateTokens("ValidationTableRow")
      .isLiteralToken(tokenIndex)
      .type<TableSeparatorToken>(tokenIndex + 1, TokenType.TableSeparatorToken)
      .isValid;

    if (notValid) return null;

    const reference = context.line.tokens.reference(tokenIndex, 1);
    const token = currentLineTokens.token<Token>(tokenIndex++, asToken);
    if (token == null) return null;

    const tokens = new TokenList(context.line, [token]);
    const tableValueReference = new NodeReference();
    const expression = context.expressionFactory.parse(tableValueReference, tokens, context.line);
    if (expression.state == "failed") {
      context.logger.fail(reference, expression.errorMessage);
      return null;
    }

    const validationTableValue = new ValidationTableValue(expression.result, tableRowReference, reference);
    tableValueReference.setNode(validationTableValue);
    return validationTableValue;
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

