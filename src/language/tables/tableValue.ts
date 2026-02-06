import type {IValidationContext} from "../../parser/context/validationContext";

import {INode, Node} from "../node";
import {TableHeader} from "./tableHeader";
import {Expression} from "../expressions/expression";
import {NodeType} from "../nodeType";
import {SourceReference} from "../sourceReference";
import {NodeReference} from "../nodeReference";
import {Symbol} from "../symbols/symbol";
import {IParseLineContext} from "../../parser/context/parseLineContext";
import {TokenList} from "../../parser/tokens/tokenList";
import {TableSeparatorToken} from "../../parser/tokens/tableSeparatorToken";
import {TokenType} from "../../parser/tokens/tokenType";
import {asToken, Token} from "../../parser/tokens/token";

export class TableValue extends Node {

  private readonly index: number;
  private readonly tableHeader: TableHeader;

  public readonly expression: Expression

  public readonly nodeType = NodeType.TableValue;

  constructor(index: number, expression: Expression, tableHeader: TableHeader, parentReference: NodeReference, reference: SourceReference) {
    super(parentReference, reference);
    this.expression = expression;
    this.index = index;
    this.tableHeader = tableHeader;
  }

  public override getChildren(): Array<INode> {
    return [this.expression];
  }

  protected override validate(context: IValidationContext): void {
    const column = this.tableHeader.getColumnByIndex(this.index);
    if (column == null) return;
    const actualType = this.expression.deriveType(context);
    const expectedType = column.typeDeclaration.type;
    if (!expectedType?.equals(actualType)) {
      context.logger.fail(this.reference, `Invalid value type '${actualType}'. Expected '${expectedType}'.`);
    }
  }

  public override getSymbol(): Symbol | null {
    return null;
  }

  public static parse(context: IParseLineContext, tableHeader: TableHeader,
                      currentLineTokens: TokenList, parentReference: NodeReference,
                      tokenIndex: number, valueIndex: number) {

    let notValid = !context.validateTokens("TableRow")
      .isLiteralToken(tokenIndex)
      .type<TableSeparatorToken>(tokenIndex + 1, TokenType.TableSeparatorToken)
      .isValid;

    if (notValid) return null;

    const valueReference = new NodeReference();
    const reference = context.line.tokens.reference(tokenIndex);
    const token = currentLineTokens.token<Token>(tokenIndex++, asToken);
    if (token == null) return null;

    const expression = context.expressionFactory.parse(valueReference, new TokenList(context.line, [token]), context.line);
    if (expression.state == "failed") {
      context.logger.fail(reference, expression.errorMessage);
      return null;
    }

    let tableValue = new TableValue(valueIndex, expression.result, tableHeader, parentReference, reference);
    valueReference.setNode(tableValue);
    return tableValue;
  }
}
