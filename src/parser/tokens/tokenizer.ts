import {Line} from "../line";
import {newParsableTokenFailed, ParsableTokenResult, newParsableTokenSuccess} from "./parsableTokenResult";
import {newTokenizeFailed, TokenizeResult, newTokenizeSuccess} from "./tokenizeResult";
import {ParsableToken} from "./parsableToken";
import {TokenList} from "./tokenList";
import {TokenCharacter} from "./tokenCharacter";
import {Token} from "./token";
import {CommentToken} from "./commentToken";
import {TokenValues} from "./tokenValues";
import {QuotedLiteralToken} from "./quotedLiteralToken";
import {OperatorToken} from "./operatorToken";
import {NumberLiteralToken} from "./numberLiteralToken";
import {BuildLiteralToken} from "./buildLiteralToken";
import {WhitespaceToken} from "./whitespaceToken";
import {Character, isLetter, isDigit, isWhitespace} from "./character";
import {BuildCommentOrDivisionToken} from "./buildCommentOrDivisionToken";
import {where} from "../../infrastructure/arrayFunctions";

const KnownTokens: Array<{value: number, factory: ((character: TokenCharacter) => ParsableToken)}> = [
  {value: TokenValues.Quote, factory: value => new QuotedLiteralToken(value)},

  {value: TokenValues.Assignment, factory: value => new OperatorToken(value)},
  {value: TokenValues.Addition, factory: value => new OperatorToken(value)},
  {value: TokenValues.Subtraction, factory: value => new OperatorToken(value)},
  {value: TokenValues.Multiplication, factory: value => new OperatorToken(value)},
  {value: TokenValues.DivisionOrComment, factory: value => new BuildCommentOrDivisionToken(value)},
  {value: TokenValues.Modulus, factory: value => new OperatorToken(value)},
  {value: TokenValues.ArgumentSeparator, factory: value => new OperatorToken(value)},

  {value: TokenValues.OpenParentheses, factory: value => new OperatorToken(value)},
  {value: TokenValues.CloseParentheses, factory: value => new OperatorToken(value)},
  {value: TokenValues.OpenBrackets, factory: value => new OperatorToken(value)},
  {value: TokenValues.CloseBrackets, factory: value => new OperatorToken(value)},

  {value: TokenValues.GreaterThan, factory: value => new OperatorToken(value)},
  {value: TokenValues.LessThan, factory: value => new OperatorToken(value)},

  {value: TokenValues.NotEqualStart, factory: value => new OperatorToken(value)},

  {value: TokenValues.And, factory: value => new OperatorToken(value)},
  {value: TokenValues.Or, factory: value => new OperatorToken(value)}
];

const TokensValidators: Array<{
  isValid: ((character: Character) => boolean),
  factory: ((character: TokenCharacter) => ParsableToken)}> = [
  { isValid: isDigit, factory: value => new NumberLiteralToken(null, value) },
  { isValid: isLetter, factory: value => new BuildLiteralToken(value) },
  { isValid: isWhitespace, factory: value => new WhitespaceToken(value) },
];


export interface ITokenizer {
  tokenize(line: Line): TokenizeResult;
}

export class Tokenizer implements ITokenizer {

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

    return newTokenizeSuccess(Tokenizer.discardWhitespaceAndComments(tokens));
  }

  private startToken(character: TokenCharacter, index: number, line: Line): ParsableTokenResult {
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

  private static discardWhitespaceAndComments(tokens: Array<Token>): TokenList {

    function notWhitespaceOrComment(token: Token): boolean {
      return !(token instanceof CommentToken) && !(token instanceof WhitespaceToken);
    }

    return new TokenList(where(tokens, notWhitespaceOrComment));
  }
}