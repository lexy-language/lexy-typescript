import type {IExpressionFactory} from "../expressionFactory";

import {Expression} from "../expression";
import {ExpressionSource} from "../expressionSource";
import {newParseExpressionFailed, newParseExpressionSuccess, ParseExpressionResult} from "../parseExpressionResult";
import {ParenthesizedExpression} from "../parenthesizedExpression";
import {ArgumentList} from "../argumentList";
import {TokenList} from "../../../parser/tokens/tokenList";
import {FunctionCallExpressions} from "./functionCallExpressions";
import {FunctionCallExpression} from "./functionCallExpression";

export  class FunctionCallExpressionParser {

  public static parse(source: ExpressionSource, factory: IExpressionFactory): ParseExpressionResult {
    let tokens = source.tokens;
    if (!FunctionCallExpression.isValid(tokens)) return newParseExpressionFailed("FunctionCallExpression", `Not valid.`);

    let matchingClosingParenthesis = ParenthesizedExpression.findMatchingClosingParenthesis(tokens);
    if (matchingClosingParenthesis == -1)
      return newParseExpressionFailed("FunctionCallExpression", `No closing parentheses found.`);

    let functionName = tokens.tokenValue(0);
    if (!functionName) return newParseExpressionFailed("FunctionCallExpression", "Invalid token.");

    let innerExpressionTokens = tokens.tokensRange(2, matchingClosingParenthesis - 1);
    let argumentsTokenList = ArgumentList.parse(innerExpressionTokens);
    if (argumentsTokenList.state != 'success') {
      return newParseExpressionFailed("FunctionCallExpression", argumentsTokenList.errorMessage);
    }
    let argumentValues = FunctionCallExpressionParser.createArgumentsValue(argumentsTokenList.result, factory, source);

    let functionCallResult = FunctionCallExpressions.parse(functionName, source, argumentValues);
    if (functionCallResult.state != "success") {
      return newParseExpressionFailed("FunctionCallExpression", functionCallResult.errorMessage);
    }

    let expression = functionCallResult.result                          ;

    return newParseExpressionSuccess(expression);
  }

  private static createArgumentsValue(argumentsTokens: Array<TokenList>, factory: IExpressionFactory, source: ExpressionSource) {
    let argumentValues = new Array<Expression>();
    argumentsTokens.forEach(argumentTokens => {
      let argumentExpression = factory.parse(argumentTokens, source.line);
      if (argumentExpression.state != 'success') return argumentExpression;

      argumentValues.push(argumentExpression.result);
    });
    return argumentValues;
  }
}
