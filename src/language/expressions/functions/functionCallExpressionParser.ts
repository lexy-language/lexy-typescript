import type {IExpressionFactory} from "../expressionFactory";

import {Expression} from "../expression";
import {ExpressionSource} from "../expressionSource";
import {newParseExpressionFailed, newParseExpressionSuccess, ParseExpressionResult} from "../parseExpressionResult";
import {ParenthesizedExpression} from "../parenthesizedExpression";
import {ArgumentList} from "../argumentList";
import {TokenList} from "../../../parser/tokens/tokenList";
import {FunctionCallExpression} from "./functionCallExpression";
import {NewFunctionExpression} from "./systemFunctions/newFunctionExpression";
import {FillParametersFunctionExpression} from "./systemFunctions/fillParametersFunctionExpression";
import {ExtractResultsFunctionExpression} from "./systemFunctions/extractResultsFunctionExpression";
import {
  newParseExpressionFunctionsFailed,
  newParseExpressionFunctionsSuccess,
  ParseExpressionFunctionsResult
} from "./parseExpressionFunctionsResult"
import {newParseFunctionCallExpressionsFailed} from "../parseFunctionCallExpressionResult";
import {newParseExpressionsFailed, newParseExpressionsSuccess, ParseExpressionsResult} from "../parseExpressionsResult";
import {Token} from "../../../parser/tokens/token";
import {asStringLiteralToken, StringLiteralToken} from "../../../parser/tokens/stringLiteralToken";
import {asMemberAccessLiteralToken, MemberAccessLiteralToken} from "../../../parser/tokens/memberAccessLiteralToken";
import {IdentifierPath} from "../../identifierPath";
import {LexyFunctionCallExpression} from "./lexyFunctionCallExpression";
import {MemberFunctionCallExpression} from "./memberFunctionCallExpression";

export class FunctionCallExpressionParser {

  private static SystemFunctions = {
    [NewFunctionExpression.functionName]: FunctionCallExpressionParser.forFirstArgument(NewFunctionExpression.create),
    [FillParametersFunctionExpression.functionName]: FunctionCallExpressionParser.forFirstArgument(FillParametersFunctionExpression.create),
    [ExtractResultsFunctionExpression.functionName]: FunctionCallExpressionParser.forFirstArgument(ExtractResultsFunctionExpression.create),
  }

  public static parse(source: ExpressionSource, factory: IExpressionFactory): ParseExpressionResult {
    let tokens = source.tokens;
    if (!FunctionCallExpression.isValid(tokens)) {
      return newParseExpressionFailed("FunctionCallExpression", `Not valid.`);
    }

    let matchingClosingParenthesis = ParenthesizedExpression.findMatchingClosingParenthesis(tokens);
    if (matchingClosingParenthesis == -1) {
      return newParseExpressionFailed("FunctionCallExpression", `No closing parentheses found.`);
    }

    let functionNameExpression = tokens.get(0);
    if (!functionNameExpression) return newParseExpressionFailed("FunctionCallExpression", "Invalid token.");

    let argumentsTokenListResult = FunctionCallExpressionParser.getArgumentTokens(source, factory, tokens, matchingClosingParenthesis);
    if (argumentsTokenListResult.state != "success") {
      return newParseExpressionFailed("FunctionCallExpression", argumentsTokenListResult.errorMessage);
    }

    let functionCallResult = FunctionCallExpressionParser.parseToken(functionNameExpression, source, argumentsTokenListResult.result);
    if (functionCallResult.state != "success") {
      return newParseExpressionFailed("FunctionCallExpression", functionCallResult.errorMessage);
    }

    return newParseExpressionSuccess(functionCallResult.result);
  }

  private static getArgumentTokens(
    source: ExpressionSource, factory: IExpressionFactory,
    tokens: TokenList, matchingClosingParenthesis: number): ParseExpressionsResult  {
    let innerExpressionTokens = tokens.tokensRange(2, matchingClosingParenthesis - 1);
    let argumentsTokenList = ArgumentList.parse(innerExpressionTokens);
    if (argumentsTokenList.state != 'success') {
      return newParseExpressionsFailed("FunctionCallExpression", argumentsTokenList.errorMessage);
    }

    let argumentValues = new Array<Expression>();
    argumentsTokenList.result.forEach(argumentTokens => {
      let argumentExpression = factory.parse(argumentTokens, source.line);
      if (argumentExpression.state != 'success') return newParseFunctionCallExpressionsFailed(argumentExpression.errorMessage);

      argumentValues.push(argumentExpression.result);
    });

    return newParseExpressionsSuccess(argumentValues);
  }

  private static parseToken(functionNameToken: Token, source: ExpressionSource,
                       argumentValues: ReadonlyArray<Expression>): ParseExpressionFunctionsResult {
    let stringLiteralToken = asStringLiteralToken(functionNameToken);
    if (stringLiteralToken != null) {
      return FunctionCallExpressionParser.parseStringLiteralFunctionCall(source, argumentValues, stringLiteralToken);
    }
    const memberAccessLiteralToken = asMemberAccessLiteralToken(functionNameToken);
    if (memberAccessLiteralToken != null) {
      return FunctionCallExpressionParser.createMemberFunctionCallExpression(source, argumentValues, memberAccessLiteralToken);
    }
    throw new Error(`Invalid token type: ${functionNameToken.tokenType}`)
  }

    private static parseStringLiteralFunctionCall(source: ExpressionSource,
                                                  argumentValues: ReadonlyArray<Expression>,
                                                  stringLiteralToken: StringLiteralToken): ParseExpressionFunctionsResult {
      const functionName = stringLiteralToken.value;
      const value = FunctionCallExpressionParser.SystemFunctions[functionName];
      if (value != null) {
        return value(source, argumentValues);
      }

      const expression = FunctionCallExpressionParser.createLexyFunctionCallExpression(functionName, source, argumentValues);
      return newParseExpressionFunctionsSuccess(expression);
    }

    private static createMemberFunctionCallExpression(source: ExpressionSource,
                                                      argumentValues: ReadonlyArray<Expression>,
                                                      memberAccessLiteralToken: MemberAccessLiteralToken): ParseExpressionFunctionsResult {
      const path = new IdentifierPath(memberAccessLiteralToken.parts);
      const expression = new MemberFunctionCallExpression(path, argumentValues, source);
        return newParseExpressionFunctionsSuccess(expression);
    }

    private static createLexyFunctionCallExpression(functionName: string, source: ExpressionSource,
                                                    argumentValues: ReadonlyArray<Expression>): LexyFunctionCallExpression {
        return new LexyFunctionCallExpression(functionName, argumentValues, source);
    }

    private static forFirstArgument(factory: (source: ExpressionSource, expression: Expression) => FunctionCallExpression):
      (source: ExpressionSource, expressions: ReadonlyArray<Expression>) => ParseExpressionFunctionsResult {
        return (reference, argumentValues) => {
            if (argumentValues.length != 1) {
                return newParseExpressionFunctionsFailed("Invalid number of args. 1 argument expected.");
            }

            var functionValue = factory(reference, argumentValues[0]);
            return newParseExpressionFunctionsSuccess(functionValue);
        };
    }
}
