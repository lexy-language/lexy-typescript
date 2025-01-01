import {
  CommentToken,
  KnownTokens,
  TokensValidators,
  WhitespaceToken
} from "./tokens";
import {Line} from "./line";
import {ITokenizer} from "./ITokenizer";
import {newParsableTokenFailed, ParsableTokenResult, newParsableTokenSuccess} from "./parsableTokenFailed";
import {newTokenizeFailed, TokenizeResult, newTokenizeSuccess} from "./tokenizeResult";
import {ParsableToken} from "./parsableToken";
import {TokenList} from "./tokenList";
import {TokenCharacter} from "./tokenCharacter";
import {Token} from "./token";

export class Tokenizer implements ITokenizer {

  private static discardWhitespace(tokens: Array<Token>): TokenList {
    const newTokens = new Array<Token>();

    for (let token of tokens) {
      if (token instanceof CommentToken) break;
      if (!(token instanceof WhitespaceToken)) {
        newTokens.push(token);
      }
    }

    return new TokenList(newTokens);
  }

  public startToken(character: TokenCharacter, index: number, line: Line): ParsableTokenResult {
    let value = character.value;

    for (let knownToken of KnownTokens) {
      if (knownToken.value == value) {
        return newParsableTokenSuccess(knownToken.factory(character));
      }
    }

    for (let validator of TokensValidators) {
      if (validator.isValid(value)) {
        return newParsableTokenSuccess(validator.factory(character));
      }
    }

    return newParsableTokenFailed(line.lineReference(index), `Invalid character at ${index} '${String.fromCharCode(value)}'`);
  }

  public tokenize(line: Line): TokenizeResult {
    let tokens = new Array<Token>();
    let current: ParsableToken | null = null;

    for (let index = 0; index < line.content.length; index++) {
      let value = line.content.charCodeAt(index);
      let tokenCharacter = new TokenCharacter(value, index);
      let valueProcessed = false;
      if (current != null) {
        let result = current.parse(tokenCharacter);
        switch (result.state) {
          case "invalid": {
            return newTokenizeFailed(line.lineReference(index), result.validationError);
          }
          case "finished": {
            tokens.push(result.newToken ?? current);
            current = null;
            valueProcessed = result.charProcessed;
            break;
          }
          case 'inProgress': {
            if (result.newToken != null) {
              current = result.newToken as ParsableToken;
              if (current == null) {
                throw new Error(
                  'New token can only be a parsable token when in progress');
              }
            }
            break;
          }
        }
      }

      if (current == null && !valueProcessed) {
        let parsableTokenResult = this.startToken(tokenCharacter, index, line);
        if (parsableTokenResult.state === "failed") {
          return newTokenizeFailed(line.lineEndReference(), parsableTokenResult.errorMessage);
        }
        current = parsableTokenResult.result;
      }
    }

    if (current != null) {
      let result = current.finalize();
      if (result.state === 'invalid') {
        return newTokenizeFailed(
          line.lineEndReference(),
          `Invalid token at end of line. ${result.validationError}`
        )
      }
      if (result.state === 'inProgress') {
        return newTokenizeFailed(
          line.lineEndReference(),
          "Parser error: result should be 'finished'");
      }
      tokens.push(result.newToken ?? current);
    }

    return newTokenizeSuccess(Tokenizer.discardWhitespace(tokens));
  }
}