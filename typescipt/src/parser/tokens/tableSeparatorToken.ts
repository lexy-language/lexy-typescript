import {ParsableToken} from "./parsableToken";
import {TokenCharacter} from "./tokenCharacter";
import {newParseTokenFinishedResult, ParseTokenResult} from "./parseTokenResult";

export class TableSeparatorToken extends ParsableToken {

  public tokenIsLiteral: boolean = false;
  public tokenType: string = 'TableSeparatorToken';

  constructor(character: TokenCharacter) {
    super(character);
  }

  public parse(character: TokenCharacter): ParseTokenResult {
    return newParseTokenFinishedResult(true);
  }

  public finalize(): ParseTokenResult {
    return newParseTokenFinishedResult(true);
  }
}