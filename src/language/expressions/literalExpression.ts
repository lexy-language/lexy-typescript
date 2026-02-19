import type {ILiteralToken} from "../../parser/tokens/ILiteralToken";
import type {INode} from "../node";
import type {IValidationContext} from "../../parser/context/validationContext";

import {Expression} from "./expression";
import {ExpressionSource} from "./expressionSource";
import {SourceReference} from "../sourceReference";
import {newParseExpressionFailed, newParseExpressionSuccess, ParseExpressionResult} from "./parseExpressionResult";
import {TokenList} from "../../parser/tokens/tokenList";
import {instanceOfNumberLiteralToken, NumberLiteralToken} from "../../parser/tokens/numberLiteralToken";
import {OperatorType} from "../../parser/tokens/operatorType";
import {Type} from "../typeSystem/type";
import {NodeType} from "../nodeType";
import {NodeReference} from "../nodeReference";
import {SymbolKind} from "../symbols/symbolKind";
import {Symbol} from "../symbols/symbol";

export function instanceOfLiteralExpression(object: any): boolean {
  return object?.nodeType == NodeType.LiteralExpression;
}

export function asLiteralExpression(object: any): LiteralExpression | null {
  return instanceOfLiteralExpression(object) ? object as LiteralExpression : null;
}

export class LiteralExpression extends Expression {

  public nodeType = NodeType.LiteralExpression;

  public literal: ILiteralToken;

  constructor(literal: ILiteralToken, source: ExpressionSource, parentReference: NodeReference, reference: SourceReference) {
    super(source, parentReference, reference);
    this.literal = literal;
  }

  public static parse(source: ExpressionSource, parentReference: NodeReference): ParseExpressionResult {
    const expression = LiteralExpression.createExpression(parentReference, source, source.tokens);
    return expression == null
      ? newParseExpressionFailed("LiteralExpression", "Invalid expression")
      : newParseExpressionSuccess(expression);
  }

  private static createExpression(parentReference: NodeReference, source: ExpressionSource, tokens: TokenList): Expression | null {

    if (!LiteralExpression.isValid(tokens)) return null;

    let reference = source.createReference();

    if (tokens.length == 2) return LiteralExpression.negativeNumeric(parentReference, source, tokens, reference);

    let literalToken = tokens.literalToken(0);
    if (!literalToken) return null;

    return new LiteralExpression(literalToken, source, parentReference, reference);
  }

  private static negativeNumeric(parentReference: NodeReference, source: ExpressionSource, tokens: TokenList, reference: SourceReference): Expression | null {
    let operatorToken = tokens.operatorToken(0);
    if (!operatorToken) return null;

    let numericLiteralToken = tokens.literalToken(1) as NumberLiteralToken;
    let value = -numericLiteralToken.numberValue;

    let negatedLiteral = new NumberLiteralToken(value, operatorToken.firstCharacter);

    return  new LiteralExpression(negatedLiteral, source, parentReference, reference);
  }

  public static isValid(tokens: TokenList): boolean {
    return tokens.length == 1
      && tokens.isLiteralToken(0)
      || tokens.length == 2
      && tokens.isOperatorToken(0, OperatorType.Subtraction)
      && tokens.isLiteralToken(1)
      && instanceOfNumberLiteralToken(tokens.literalToken(1));
  }

  public override getChildren(): Array<INode> {
    return [];
  }

  protected override validate(context: IValidationContext): void {
  }

  public override deriveType(context: IValidationContext): Type | null {
    return this.literal.deriveType(context);
  }

  public override getSymbol(): Symbol | null {
    return new Symbol(this.reference, this.literal.toString(), "", SymbolKind.Constant);
  }

  override toString(): string {
    return this.literal.toString();
  }
}
