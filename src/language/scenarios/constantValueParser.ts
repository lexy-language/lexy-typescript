import {Expression} from "../expressions/expression";
import {
  ConstantValueParseResult,
  newConstantValueParseFailed,
  newConstantValueParseSuccess
} from "./constantValueParseResult";
import {asLiteralExpression, LiteralExpression} from "../expressions/literalExpression";
import {asMemberAccessExpression, MemberAccessExpression} from "../expressions/memberAccessExpression";
import {ConstantValue} from "./constantValue";

export class ConstantValueParser {
  public static parse(expression: Expression): ConstantValueParseResult {
    const literalExpression = asLiteralExpression(expression);
    if (literalExpression != null) {
      return this.parseLiteralExpression(literalExpression);
    }
    const memberAccessExpression = asMemberAccessExpression(expression);
    if (memberAccessExpression != null) {
      return this.parseMemberAccessExpression(memberAccessExpression);
    }
    return newConstantValueParseFailed(`Invalid expression variable. Expected: 'Variable = ConstantValue'`);
  }

  private static parseLiteralExpression(literalExpression: LiteralExpression): ConstantValueParseResult {
    let value = new ConstantValue(literalExpression.literal.typedValue);
    return newConstantValueParseSuccess(value);
  }

  private static parseMemberAccessExpression(literalExpression: MemberAccessExpression): ConstantValueParseResult {
    return newConstantValueParseSuccess(new ConstantValue(literalExpression.memberAccessLiteral.value));
  }
}