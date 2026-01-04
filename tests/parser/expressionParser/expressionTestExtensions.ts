import {Expression} from "../../../src/language/expressions/expression";
import {asIdentifierExpression, IdentifierExpression} from "../../../src/language/expressions/identifierExpression";
import {asLiteralExpression, LiteralExpression} from "../../../src/language/expressions/literalExpression";
import {asNumberLiteralToken, NumberLiteralToken} from "../../../src/parser/tokens/numberLiteralToken";
import {asQuotedLiteralToken, QuotedLiteralToken} from "../../../src/parser/tokens/quotedLiteralToken";
import {asDateTimeLiteral, DateTimeLiteralToken} from "../../../src/parser/tokens/dateTimeLiteralToken";
import {
  asMemberAccessExpression,
  MemberAccessExpression
} from "../../../src/language/expressions/memberAccessExpression";
import {asBooleanLiteral, BooleanLiteralToken} from "../../../src/parser/tokens/booleanLiteralToken";
import {validateOfType} from "../../validateOfType";

export function validateVariableExpression(expression: Expression, name: string): void {
  validateOfType<IdentifierExpression>(asIdentifierExpression, expression, left =>
    expect(left.identifier).toBe(name));
}

export function validateNumericLiteralExpression(expression: Expression | null, value: number): void {
  validateOfType<LiteralExpression>(asLiteralExpression, expression, literal => {
    validateOfType<NumberLiteralToken>(asNumberLiteralToken, literal.literal, number =>
      expect(number.numberValue).toBe(value));
  });
}

export function validateQuotedLiteralExpression(expression: Expression | null, value: string): void {
  validateOfType<LiteralExpression>(asLiteralExpression, expression, literal => {
    validateOfType<QuotedLiteralToken>(asQuotedLiteralToken, literal.literal, number =>
      expect(number.value).toBe(value));
  });
}

export function validateBooleanLiteralExpression(expression: Expression | null, value: boolean): void {
  validateOfType<LiteralExpression>(asLiteralExpression, expression, literal => {
    validateOfType<BooleanLiteralToken>(asBooleanLiteral, literal.literal, number =>
      expect(number.booleanValue).toBe(value));
  });
}


export function validateDateTimeLiteralExpression(expression: Expression | null, value: string): void {
  let valueDate = DateTimeLiteralToken.parseValue(value);
  validateOfType<LiteralExpression>(asLiteralExpression, expression, literal =>
    validateOfType<DateTimeLiteralToken>(asDateTimeLiteral, literal.literal, number =>
      expect(number.dateTimeValue?.toISOString()).toBe(valueDate.toISOString())));
}

export function validateIdentifierExpression(expression: Expression, value: string): void {
  validateOfType<IdentifierExpression>(asIdentifierExpression, expression,
    literal => expect(literal.identifier).toBe(value));
}

export function validateMemberAccessExpression(expression: Expression | null, value: string): void {
  validateOfType<MemberAccessExpression>(asMemberAccessExpression, expression,
    literal => expect(literal.identifierPath.toString()).toBe(value));
}