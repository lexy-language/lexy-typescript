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
import {OperatorType} from "./operatorType";

export class BuildCommentOrDivisionToken extends ParsableToken {

  public tokenIsLiteral: boolean = false;
  public tokenType = TokenType.BuildCommentOrDivisionToken;

  constructor(character: TokenCharacter) {
    super(character);
  }

  public parse(character: TokenCharacter): ParseTokenResult {
    if (this.value.length != 1) throw new Error("Length should not exceed 1");

    return this.buildToken(character);
  }

  private buildToken(character: TokenCharacter) {
    if (character.value != TokenValues.DivisionOrComment) {
      return newParseTokenFinishedResult(false, new OperatorToken(this.firstCharacter, OperatorType.Division));
    } else {
      let commentToken = new CommentToken(this.firstCharacter, this.value);
      return newParseTokenInProgressResult(commentToken);
    }
  }

  public endOfLine(): ParseTokenResult {
    return newParseTokenFinishedResult(true, new OperatorToken(this.firstCharacter, OperatorType.Division));
  }
}