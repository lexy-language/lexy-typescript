import {ParsableToken} from "./parsableToken";
import {ILiteralToken} from "./ILiteralToken";
import {TokenCharacter} from "./tokenCharacter";
import {TokenValues} from "./tokenValues";
import {IValidationContext} from "../IValidationContext";
import {PrimitiveType, VariableType} from "../../language/variableTypes";
import {
  newParseTokenFinishedResult,
  newParseTokenInProgressResult,
  newParseTokenInvalidResult,
  ParseTokenResult
} from "./parseTokenResult";

export class QuotedLiteralToken extends ParsableToken implements ILiteralToken {
  private quoteClosed: boolean = false;

  public tokenIsLiteral: boolean = true;
  public tokenType: string = 'QuotedLiteralToken';

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
      return newParseTokenFinishedResult(true, this);
    }

    this.appendValue(value);
    return newParseTokenInProgressResult();
  }

  public finalize(): ParseTokenResult {
    if (!this.quoteClosed) return newParseTokenInvalidResult("Closing quote expected.");

    return newParseTokenFinishedResult(true, this);
  }

  public toString() {
    return this.value;
  }
}