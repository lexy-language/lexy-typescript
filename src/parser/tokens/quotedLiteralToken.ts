import type {IValidationContext} from "../validationContext";
import type {ILiteralToken} from "./ILiteralToken";

import {ParsableToken} from "./parsableToken";
import {TokenCharacter} from "./tokenCharacter";
import {TokenValues} from "./tokenValues";
import {
  newParseTokenFinishedResult,
  newParseTokenInProgressResult,
  newParseTokenInvalidResult,
  ParseTokenResult
} from "./parseTokenResult";
import {VariableType} from "../../language/variableTypes/variableType";
import {PrimitiveType} from "../../language/variableTypes/primitiveType";
import {TokenType} from "./tokenType";

export function instanceOfQuotedLiteralToken(object: any): object is QuotedLiteralToken {
  return object?.tokenType == TokenType.QuotedLiteralToken;
}

export function asQuotedLiteralToken(object: any): QuotedLiteralToken | null {
  return instanceOfQuotedLiteralToken(object) ? object as QuotedLiteralToken : null;
}

export class QuotedLiteralToken extends ParsableToken implements ILiteralToken {

  private quoteClosed: boolean = false;

  public tokenIsLiteral: boolean = true;
  public tokenType = TokenType.QuotedLiteralToken;

  constructor(character: TokenCharacter) {
    super(character, '');

    let value = character.value;
    if (value != TokenValues.Quote) throw new Error("QuotedLiteralToken should start with a quote");
  }

  public get typedValue() {
    return this.value;
  }

  public deriveType(context: IValidationContext): VariableType {
    return PrimitiveType.string;
  }

  public parse(character: TokenCharacter): ParseTokenResult {
    let value = character.value;
    if (this.quoteClosed) throw new Error("No characters allowed after closing quote.");

    if (value == TokenValues.Quote) {
      this.quoteClosed = true;
      return newParseTokenFinishedResult(true);
    }

    this.appendValue(value);
    return newParseTokenInProgressResult();
  }

  public endOfLine(): ParseTokenResult {
    if (!this.quoteClosed) return newParseTokenInvalidResult("Closing quote expected.");

    throw new Error("Token should be finished by the Parse method before reaching end of line");
  }

  public toString() {
    return this.value;
  }
}
