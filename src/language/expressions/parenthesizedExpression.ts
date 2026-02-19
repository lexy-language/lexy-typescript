import type {INode} from "../node";
import type {IValidationContext} from "../../parser/context/validationContext";

import {Expression} from "./expression";
import {OperatorToken} from "../../parser/tokens/operatorToken";
import {OperatorType} from "../../parser/tokens/operatorType";
import {SourceReference} from "../sourceReference";
import {ExpressionSource} from "./expressionSource";
import {newParseExpressionFailed, newParseExpressionSuccess, ParseExpressionResult} from "./parseExpressionResult";
import {TokenList} from "../../parser/tokens/tokenList";
import {Type} from "../typeSystem/type";
import {NodeType} from "../nodeType";
import {NodeReference} from "../nodeReference";
import {Symbol} from "../symbols/symbol";
import {ExpressionFactory} from "./expressionFactory";

export function instanceOfParenthesizedExpression(object: any): object is ParenthesizedExpression {
  return object?.nodeType == NodeType.ParenthesizedExpression;
}

export function asParenthesizedExpression(object: any): ParenthesizedExpression | null {
  return instanceOfParenthesizedExpression(object) ? object as ParenthesizedExpression : null;
}

export class ParenthesizedExpression extends Expression {

  public nodeType = NodeType.ParenthesizedExpression;

  public expression: Expression;

  constructor(expression: Expression, source: ExpressionSource, parentReference: NodeReference, reference: SourceReference) {
    super(source, parentReference, reference);
    this.expression = expression;
  }

  public static parse(source: ExpressionSource, parentReference: NodeReference): ParseExpressionResult {
    const tokens = source.tokens;
    if (!ParenthesizedExpression.isValid(tokens)) {
      return newParseExpressionFailed("ParenthesizedExpression", `Not valid.`);
    }

    const matchingClosingParenthesis = ParenthesizedExpression.findMatchingClosingParenthesis(tokens);
    if (matchingClosingParenthesis == -1) {
      return newParseExpressionFailed("ParenthesizedExpression", `No closing parentheses found.`);
    }

    const expressionReference = new NodeReference();
    const innerExpressionTokens = tokens.tokensRange(1, matchingClosingParenthesis - 1);
    const innerExpression = ExpressionFactory.parse(expressionReference, innerExpressionTokens, source.line);
    if (innerExpression.state != 'success') return innerExpression;

    const reference = source.createReference();

    const expression = new ParenthesizedExpression(innerExpression.result, source, expressionReference, reference);
    expressionReference.setNode(expression);

    return newParseExpressionSuccess(expression);
  }

  public static findMatchingClosingParenthesis(tokens: TokenList): number {
    let count = 0;
    for (let index = 0; index < tokens.length; index++) {
      let token = tokens.get(index);
      if (token.tokenType != "OperatorToken") continue;

      const operatorToken = token as OperatorToken;
      if (operatorToken.type == OperatorType.OpenParentheses) {
        count++;
      } else if (operatorToken.type == OperatorType.CloseParentheses) {
        count--;
        if (count == 0) return index;
      }
    }

    return -1;
  }

  public static isValid(tokens: TokenList): boolean {
    return tokens.isOperatorToken(0, OperatorType.OpenParentheses);
  }

  public override getChildren(): Array<INode> {
    return [this.expression];
  }

  protected override validate(context: IValidationContext): void {
  }

  public override deriveType(context: IValidationContext): Type | null {
    return this.expression.deriveType(context);
  }

  public override getSymbol(): Symbol | null {
    return null;
  }
}
