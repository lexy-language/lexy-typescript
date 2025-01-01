import {ParsableToken} from "./parsableToken";
import {TokenCharacter} from "./tokenCharacter";
import {newParseTokenFinishedResult, newParseTokenInProgressResult, ParseTokenResult} from "./parseTokenResult";

export class CommentToken extends ParsableToken {

  public tokenIsLiteral: boolean = false;
  public tokenType: string = 'CommentToken';

  constructor(character: TokenCharacter) {
    super(character);
  }

  public parse(character: TokenCharacter): ParseTokenResult {
    this.appendValue(character.value);
    return newParseTokenInProgressResult();
  }

  public finalize(): ParseTokenResult {
    return newParseTokenFinishedResult(true);
  }
}