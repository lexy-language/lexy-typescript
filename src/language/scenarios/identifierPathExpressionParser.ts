import {Expression} from "../expressions/expression";
import {
  newIdentifierPathParseFailed,
  newIdentifierPathParseSuccess,
  IdentifierPathParseResult
} from "./identifierPathParseResult";
import {asMemberAccessExpression, MemberAccessExpression} from "../expressions/memberAccessExpression";
import {asLiteralExpression, LiteralExpression} from "../expressions/literalExpression";
import {asIdentifierExpression} from "../expressions/identifierExpression";
import {IdentifierPath} from "../identifierPath";
import {asStringLiteralToken} from "../../parser/tokens/stringLiteralToken";

export class IdentifierPathExpressionParser {
  public static parseExpression(expression: Expression): IdentifierPathParseResult {

    const memberAccessExpression = asMemberAccessExpression(expression);
    if (memberAccessExpression != null) {
      return IdentifierPathExpressionParser.parseMemberAccessExpression(memberAccessExpression);
    }

    const literalExpression = asLiteralExpression(expression);
    if (literalExpression != null) {
      return IdentifierPathExpressionParser.parseLiteralExpression(literalExpression);
    }

    const identifierExpression = asIdentifierExpression(expression);
    if (identifierExpression != null) {
      return newIdentifierPathParseSuccess(new IdentifierPath(identifierExpression.identifier.split(".")));
    }

    return newIdentifierPathParseFailed(`Invalid constant value. Expected: 'Variable = ConstantValue'`);
  }

  private static parseLiteralExpression(literalExpression: LiteralExpression): IdentifierPathParseResult {
    const stringLiteral = asStringLiteralToken(literalExpression.literal);
    if (stringLiteral != null) {
      return newIdentifierPathParseSuccess(new IdentifierPath(stringLiteral.value.split(".")))
    }
    return newIdentifierPathParseFailed(`Invalid expression literal. Expected: 'Variable = ConstantValue'`);
  }

  private static parseMemberAccessExpression(memberAccessExpression: MemberAccessExpression): IdentifierPathParseResult {
    if (memberAccessExpression.memberAccessLiteral.parts.length == 0) {
      return newIdentifierPathParseFailed(
        `Invalid number of variable reference parts: ${memberAccessExpression.memberAccessLiteral.parts.length}`);
    }

    let identifierPath = new IdentifierPath(memberAccessExpression.memberAccessLiteral.parts);
    return newIdentifierPathParseSuccess(identifierPath);
  }
}
