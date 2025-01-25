import {Token} from "../../src/parser/tokens/token";
import {validateOfType} from "../validateOfType";
import {asStringLiteralToken, StringLiteralToken} from "../../src/parser/tokens/stringLiteralToken";

export function validateStringLiteralToken(token: Token, value: string): void {
  validateOfType<StringLiteralToken>(asStringLiteralToken, token, actual => expect(actual.value).toBe(value));
}
