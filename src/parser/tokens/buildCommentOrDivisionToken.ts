import {ParsableToken} from "./parsableToken";
import {TokenCharacter} from "./tokenCharacter";
import {
  newParseTokenFinishedResult,
  newParseTokenInProgressResult,
  newParseTokenInvalidResult,
  ParseTokenResult
} from "./parseTokenResult";
import {TokenType} from "./tokenType";
import {OperatorToken} from "./operatorToken";
import {TokenValues} from "./tokenValues";
import {CommentToken} from "./commentToken";

export class BuildCommentOrDivisionToken extends ParsableToken {

  public tokenIsLiteral: boolean = false;
  public tokenType = TokenType.BuildCommentOrDivisionToken;

  constructor(character: TokenCharacter) {
    super(character);
  }

  public parse(character: TokenCharacter): ParseTokenResult {
    if (this.value.length != 1) throw new Error("Length should not exceed 1");

    return character.value != TokenValues.DivisionOrComment
      ? newParseTokenFinishedResult(false, new OperatorToken(this.firstCharacter))
      : newParseTokenInProgressResult(new CommentToken(this.firstCharacter, this.value));
  }

  public finalize(): ParseTokenResult {
    return newParseTokenInvalidResult("Unexpected end of line. Can't end with a single '/'.");
  }
}