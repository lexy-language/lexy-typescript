import type {INode} from "../node";
import type {IValidationContext} from "../../parser/context/validationContext";

import {Expression} from "./expression";
import {ExpressionSource} from "./expressionSource";
import {SourceReference} from "../sourceReference";
import {newParseExpressionFailed, newParseExpressionSuccess, ParseExpressionResult} from "./parseExpressionResult";
import {TokenList} from "../../parser/tokens/tokenList";
import {OperatorType} from "../../parser/tokens/operatorType";
import {OperatorToken} from "../../parser/tokens/operatorToken";
import {Type} from "../typeSystem/type";
import {NodeType} from "../nodeType";
import {TokenType} from "../../parser/tokens/tokenType";
import {NodeReference} from "../nodeReference";
import {Symbol} from "../symbols/symbol";
import {ExpressionFactory} from "./expressionFactory";

export function instanceOfBracketedExpression(object: any): object is BracketedExpression {
  return object?.nodeType == NodeType.BracketedExpression;
}

export function asBracketedExpression(object: any): BracketedExpression | null {
  return instanceOfBracketedExpression(object) ? object as BracketedExpression : null;
}

export class BracketedExpression extends Expression {

  public nodeType = NodeType.BracketedExpression;
  public functionName: string
  public expression: Expression

  constructor(functionName: string, expression: Expression,
              parentReference: NodeReference, source: ExpressionSource,
              reference: SourceReference) {
    super(source, parentReference, reference)
    this.functionName = functionName;
    this.expression = expression;
  }

  public static parse(source: ExpressionSource, parentReference: NodeReference): ParseExpressionResult {
    const tokens = source.tokens;
    if (!BracketedExpression.isValid(tokens)) {
      return newParseExpressionFailed("BracketedExpression", `Not valid.`);
    }

    const matchingClosingParenthesis = BracketedExpression.findMatchingClosingBracket(tokens);
    if (matchingClosingParenthesis == -1) {
      return newParseExpressionFailed("BracketedExpression", `No closing bracket found.`);
    }

    const expressionReference = new NodeReference();
    const functionName = tokens.tokenValue(0);
    if (functionName == null) return newParseExpressionFailed("BracketedExpression", `Invalid function name.`);

    const innerExpressionTokens = tokens.tokensRange(2, matchingClosingParenthesis - 1);
    const innerExpression = ExpressionFactory.parse(expressionReference, innerExpressionTokens, source.line);
    if (innerExpression.state != 'success') return innerExpression;

    const reference = source.createReference();

    const expression = new BracketedExpression(functionName, innerExpression.result, parentReference, source, reference);
    expressionReference.setNode(expression);
    return newParseExpressionSuccess(expression);
  }

  public static isValid(tokens: TokenList): boolean {
    return tokens.length > 1
      && tokens.isTokenType(0, TokenType.StringLiteralToken)
      && tokens.isOperatorToken(1, OperatorType.OpenBrackets);
  }

  private static findMatchingClosingBracket(tokens: TokenList): number {
    let count = 0;
    for (let index = 0; index < tokens.length; index++) {
      let token = tokens.get(index);
      if (token.tokenType != "OperatorToken") continue;

      const operatorToken = token as OperatorToken;
      if (operatorToken.type == OperatorType.OpenBrackets) {
        count++;
      } else if (operatorToken.type == OperatorType.CloseBrackets) {
        count--;
        if (count == 0) return index;
      }
    }

    return -1;
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
