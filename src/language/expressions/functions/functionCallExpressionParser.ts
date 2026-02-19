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
import {asMemberAccessToken, MemberAccessToken} from "../../../parser/tokens/memberAccessToken";
import {IdentifierPath} from "../../identifierPath";
import {LexyFunctionCallExpression} from "./lexyFunctionCallExpression";
import {MemberFunctionCallExpression} from "./memberFunctionCallExpression";
import {NodeReference} from "../../nodeReference";
import {ExpressionFactory} from "../expressionFactory";

export class FunctionCallExpressionParser {

  private static SystemFunctions = {
    [NewFunctionExpression.functionName]: NewFunctionExpression.create,
    [FillParametersFunctionExpression.functionName]: FillParametersFunctionExpression.create,
    [ExtractResultsFunctionExpression.functionName]: ExtractResultsFunctionExpression.create,
  }

  public static parse(source: ExpressionSource, parentReference: NodeReference): ParseExpressionResult {
    const tokens = source.tokens;
    if (!FunctionCallExpression.isValid(tokens)) {
      return newParseExpressionFailed("FunctionCallExpression", `Not valid.`);
    }

    const matchingClosingParenthesis = ParenthesizedExpression.findMatchingClosingParenthesis(tokens);
    if (matchingClosingParenthesis == -1) {
      return newParseExpressionFailed("FunctionCallExpression", `No closing parentheses found.`);
    }

    const functionCallReference = new NodeReference();
    const argumentsTokenListResult = FunctionCallExpressionParser.getArgumentTokens(functionCallReference, source, tokens, matchingClosingParenthesis);
    if (argumentsTokenListResult.state != "success") {
      return newParseExpressionFailed("FunctionCallExpression", argumentsTokenListResult.errorMessage);
    }

    const functionNameToken = tokens.get(0);
    const functionCall = FunctionCallExpressionParser.parseToken(functionNameToken, source, parentReference, argumentsTokenListResult.result);
    if (functionCall.state != "success") {
      return newParseExpressionFailed("FunctionCallExpression", functionCall.errorMessage);
    }

    functionCallReference.setNode(functionCall.result);

    return newParseExpressionSuccess(functionCall.result);
  }

  private static getArgumentTokens(
    functionCallReference: NodeReference,
    source: ExpressionSource,
    tokens: TokenList, matchingClosingParenthesis: number): ParseExpressionsResult  {
    const innerExpressionTokens = tokens.tokensRange(2, matchingClosingParenthesis - 1);
    const argumentsTokenList = ArgumentList.parse(innerExpressionTokens);
    if (argumentsTokenList.state != 'success') {
      return newParseExpressionsFailed("FunctionCallExpression", argumentsTokenList.errorMessage);
    }

    const argumentValues = new Array<Expression>();
    argumentsTokenList.result.forEach(argumentTokens => {
      const argumentExpression = ExpressionFactory.parse(functionCallReference, argumentTokens, source.line);
      if (argumentExpression.state != 'success') return newParseFunctionCallExpressionsFailed(argumentExpression.errorMessage);

      argumentValues.push(argumentExpression.result);
    });

    return newParseExpressionsSuccess(argumentValues);
  }

  private static parseToken(functionNameToken: Token, source: ExpressionSource,
                            parentReference: NodeReference,
                            argumentValues: ReadonlyArray<Expression>): ParseExpressionFunctionsResult {
    let stringLiteralToken = asStringLiteralToken(functionNameToken);
    if (stringLiteralToken != null) {
      return FunctionCallExpressionParser.parseStringLiteralFunctionCall(stringLiteralToken, argumentValues, parentReference, source);
    }
    const memberAccessToken = asMemberAccessToken(functionNameToken);
    if (memberAccessToken != null) {
      return FunctionCallExpressionParser.createMemberFunctionCallExpression(memberAccessToken, argumentValues, parentReference, source);
    }
    throw new Error(`Invalid token type: ${functionNameToken.tokenType}`)
  }

  private static parseStringLiteralFunctionCall(stringLiteralToken: StringLiteralToken,
                                                argumentValues: ReadonlyArray<Expression>,
                                                parentReference: NodeReference,
                                                source: ExpressionSource): ParseExpressionFunctionsResult {
    const functionName = stringLiteralToken.value;
    const value = FunctionCallExpressionParser.SystemFunctions[functionName];
    if (value != null) {
      return FunctionCallExpressionParser.parseSystemFunctionCall(argumentValues, parentReference, source, value);
    }

    const expression = FunctionCallExpressionParser.createLexyFunctionCallExpression(functionName, argumentValues, parentReference, source);
    return newParseExpressionFunctionsSuccess(expression);
  }

  private static parseSystemFunctionCall(args: readonly Expression[],
                                         parentReference: NodeReference,
                                         source: ExpressionSource, value: (expression: Expression, parent: NodeReference, source: ExpressionSource) => FunctionCallExpression): ParseExpressionFunctionsResult {

    if (args.length != 1) {
      return newParseExpressionFunctionsFailed("Invalid number of arguments. 1 argument expected.");
    }

    const expression = value(args[0], parentReference, source);
    return newParseExpressionFunctionsSuccess(expression);
  }

  private static createMemberFunctionCallExpression(memberAccessToken: MemberAccessToken,
                                                    argumentValues: ReadonlyArray<Expression>,
                                                    parentReference: NodeReference,
                                                    source: ExpressionSource): ParseExpressionFunctionsResult {
    const path = new IdentifierPath(memberAccessToken.parts);
    const expression = new MemberFunctionCallExpression(path, argumentValues, parentReference, source);
    return newParseExpressionFunctionsSuccess(expression);
  }

  private static createLexyFunctionCallExpression(functionName: string,
                                                  argumentValues: ReadonlyArray<Expression>,
                                                  parentReference: NodeReference,
                                                  source: ExpressionSource): LexyFunctionCallExpression {

    return new LexyFunctionCallExpression(functionName, argumentValues, parentReference, source);
  }
}
