import {
  newVariablePathParseFailed,
  newVariablePathParseSuccess,
  VariablePathParseResult
} from "./variablePathParseResult";
import {Expression} from "../expressions/expression";
import {VariablePath} from "../variablePath";
import {asMemberAccessExpression, MemberAccessExpression} from "../expressions/memberAccessExpression";
import {asLiteralExpression, LiteralExpression} from "../expressions/literalExpression";
import {asIdentifierExpression} from "../expressions/identifierExpression";
import {asStringLiteralToken} from "../../parser/tokens/stringLiteralToken";
import {isNullOrEmpty} from "../../parser/tokens/character";

export class VariablePathParser {

  public static parse(parts: string[]): VariablePathParseResult {
    let variablePath = new VariablePath(parts);
    return newVariablePathParseSuccess(variablePath);
  }

  static parseString(path: string): VariablePath {
    if (isNullOrEmpty(path)) throw new Error("Invalid empty variable reference.")
    const parts = path.split(".");
    return new VariablePath(parts);
  }

  public static parseExpression(expression: Expression): VariablePathParseResult {

    const memberAccessExpression = asMemberAccessExpression(expression);
    if (memberAccessExpression != null) {
      return VariablePathParser.parseMemberAccessExpression(memberAccessExpression);
    }

    const literalExpression = asLiteralExpression(expression);
    if (literalExpression != null) {
      return VariablePathParser.parseLiteralExpression(literalExpression);
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
