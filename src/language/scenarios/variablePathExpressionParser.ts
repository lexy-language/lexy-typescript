import {Expression} from "../expressions/expression";
import {
  newIdentifierPathParseFailed,
  newIdentifierPathParseSuccess,
  VariablePathParseResult
} from "./variablePathParseResult";
import {asMemberAccessExpression, MemberAccessExpression} from "../expressions/memberAccessExpression";
import {asLiteralExpression, LiteralExpression} from "../expressions/literalExpression";
import {asIdentifierExpression} from "../expressions/identifierExpression";
import {IdentifierPath} from "../identifierPath";
import {asStringLiteralToken} from "../../parser/tokens/stringLiteralToken";

export class VariablePathExpressionParser {
  public static parseExpression(expression: Expression): VariablePathParseResult {

    const memberAccessExpression = asMemberAccessExpression(expression);
    if (memberAccessExpression != null) {
      return VariablePathExpressionParser.parseMemberAccessExpression(memberAccessExpression);
    }

    const literalExpression = asLiteralExpression(expression);
    if (literalExpression != null) {
      return VariablePathExpressionParser.parseLiteralExpression(literalExpression);
    }

    const identifierExpression = asIdentifierExpression(expression);
    if (identifierExpression != null) {
      return newIdentifierPathParseSuccess(new IdentifierPath(identifierExpression.identifier.split(".")));
    }

    return newIdentifierPathParseFailed(`Invalid constant value. Expected: 'Variable = ConstantValue'`);
  }

  private static parseLiteralExpression(literalExpression: LiteralExpression): VariablePathParseResult {
    const stringLiteral = asStringLiteralToken(literalExpression.literal);
    if (stringLiteral != null) {
      return newIdentifierPathParseSuccess(new IdentifierPath(stringLiteral.value.split(".")))
    }
    return newIdentifierPathParseFailed(`Invalid expression literal. Expected: 'Variable = ConstantValue'`);
  }

  private static parseMemberAccessExpression(memberAccessExpression: MemberAccessExpression): VariablePathParseResult {
    if (memberAccessExpression.memberAccessLiteral.parts.length == 0) {
      return newIdentifierPathParseFailed(
        `Invalid number of variable reference parts: ${memberAccessExpression.memberAccessLiteral.parts.length}`);
    }

    let identifierPath = new IdentifierPath(memberAccessExpression.memberAccessLiteral.parts);
    return newIdentifierPathParseSuccess(identifierPath);
  }
}