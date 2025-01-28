import {Expression} from "../expressions/expression";
import {
  newVariablePathParseFailed,
  newVariablePathParseSuccess,
  VariablePathParseResult
} from "./variablePathParseResult";
import {asMemberAccessExpression, MemberAccessExpression} from "../expressions/memberAccessExpression";
import {asLiteralExpression, LiteralExpression} from "../expressions/literalExpression";
import {asIdentifierExpression} from "../expressions/identifierExpression";
import {VariablePath} from "../variablePath";
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
      return newVariablePathParseSuccess(new VariablePath(identifierExpression.identifier.split(".")));
    }

    return newVariablePathParseFailed(`Invalid constant value. Expected: 'Variable = ConstantValue'`);
  }

  private static parseLiteralExpression(literalExpression: LiteralExpression): VariablePathParseResult {
    const stringLiteral = asStringLiteralToken(literalExpression.literal);
    if (stringLiteral != null) {
      return newVariablePathParseSuccess(new VariablePath(stringLiteral.value.split(".")))
    }
    return newVariablePathParseFailed(`Invalid expression literal. Expected: 'Variable = ConstantValue'`);
  }

  private static parseMemberAccessExpression(memberAccessExpression: MemberAccessExpression): VariablePathParseResult {
    if (memberAccessExpression.memberAccessLiteral.parts.length == 0) {
      return newVariablePathParseFailed(
        `Invalid number of variable reference parts: ${memberAccessExpression.memberAccessLiteral.parts.length}`);
    }

    let variablePath = new VariablePath(memberAccessExpression.memberAccessLiteral.parts);
    return newVariablePathParseSuccess(variablePath);
  }
}