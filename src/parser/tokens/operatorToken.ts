import type {IToken} from "./token";

import {ParsableToken} from "./parsableToken";
import {OperatorType} from "./operatorType";
import {TokenValues} from "./tokenValues";
import {TokenCharacter} from "./tokenCharacter";
import {
  newParseTokenFinishedResult,
  newParseTokenInProgressResult,
  newParseTokenInvalidResult,
  ParseTokenResult
} from "./parseTokenResult";
import {TableSeparatorToken} from "./tableSeparatorToken";
import {Character} from "./character";
import {isDigitOrLetter} from "./character";
import {TokenType} from "./tokenType";

export interface IOperatorToken extends IToken {
  type: OperatorType;
}

enum CombinationMatch {
  Invalid,
  Incomplete,
  Complete,
  CompleteNotProcessed
}

class OperatorCombinations
{
  private firstChar: Character;
  private secondChar: Character | null;
  private thirdChar: Character | null;
  private chars: number;

  public type: OperatorType;

  constructor(type: OperatorType, firstChar: Character,
              secondChar: Character | null = null, thirdChar: Character | null = null) {
    this.type = type;
    this.firstChar = firstChar;
    this.secondChar = secondChar;
    this.thirdChar = thirdChar;
    this.chars = thirdChar != null ? 3 : secondChar != null ? 2 : 1;
  }

  public matches(firstCharacter: Character, secondCharacter: Character | null, thirdCharacter: Character | null): CombinationMatch {

    if (firstCharacter != this.firstChar) return CombinationMatch.Invalid;

    if (secondCharacter == null) {
        return this.chars == 1 ? CombinationMatch.Complete : CombinationMatch.Invalid;
    }

    if (thirdCharacter == null) {
      if (this.chars == 3) {
        return secondCharacter == this.secondChar ? CombinationMatch.Incomplete : CombinationMatch.Invalid;
      }
      if (this.chars == 2) {
        return secondCharacter == this.secondChar ? CombinationMatch.Complete : CombinationMatch.Invalid;
      }
      if (this.chars == 1) {
        return CombinationMatch.CompleteNotProcessed;
      }
    }

    return thirdCharacter == this.thirdChar && secondCharacter == this.secondChar
      ? CombinationMatch.Complete
      : CombinationMatch.Invalid;
  }
}

export function instanceOfOperatorToken(object: any): object is OperatorToken {
  return object?.tokenType == TokenType.OperatorToken;
}

export function asOperatorToken(object: any): OperatorToken | null {
  return instanceOfOperatorToken(object) ? object as OperatorToken : null;
}

export class OperatorToken extends ParsableToken implements IOperatorToken {

  public tokenIsLiteral = false;
  public tokenType = TokenType.OperatorToken;
  public type: OperatorType = OperatorType.NotSet;

  private static readonly terminatorValues = [
    TokenValues.Space,
    TokenValues.ArgumentSeparator,
    TokenValues.Subtraction,
    TokenValues.OpenParentheses,
    TokenValues.OpenBrackets,
    TokenValues.CloseParentheses,
    TokenValues.CloseBrackets
  ];

  private static readonly operatorCombinations = [

    new OperatorCombinations(OperatorType.GreaterThanOrEqual, TokenValues.GreaterThan, TokenValues.Assignment),
    new OperatorCombinations(OperatorType.LessThanOrEqual, TokenValues.LessThan, TokenValues.Assignment),
    new OperatorCombinations(OperatorType.Equals, TokenValues.Assignment, TokenValues.Assignment),
    new OperatorCombinations(OperatorType.NotEqual, TokenValues.NotEqualStart, TokenValues.Assignment),

    new OperatorCombinations(OperatorType.Assignment, TokenValues.Assignment),
    new OperatorCombinations(OperatorType.Addition, TokenValues.Addition),
    new OperatorCombinations(OperatorType.Subtraction, TokenValues.Subtraction),
    new OperatorCombinations(OperatorType.Multiplication, TokenValues.Multiplication),
    //Division is handled by buildCommentOrDivisionToken
    new OperatorCombinations(OperatorType.Modulus, TokenValues.Modulus),
    new OperatorCombinations(OperatorType.OpenParentheses, TokenValues.OpenParentheses),
    new OperatorCombinations(OperatorType.CloseParentheses, TokenValues.CloseParentheses),
    new OperatorCombinations(OperatorType.OpenBrackets, TokenValues.OpenBrackets),
    new OperatorCombinations(OperatorType.CloseBrackets, TokenValues.CloseBrackets),

    new OperatorCombinations(OperatorType.GreaterThan, TokenValues.GreaterThan),
    new OperatorCombinations(OperatorType.LessThan, TokenValues.LessThan),

    new OperatorCombinations(OperatorType.ArgumentSeparator, TokenValues.ArgumentSeparator),
    new OperatorCombinations(OperatorType.And, TokenValues.And, TokenValues.And),
    new OperatorCombinations(OperatorType.Or, TokenValues.Or, TokenValues.Or),

    new OperatorCombinations(OperatorType.Spread, TokenValues.Spread, TokenValues.Spread, TokenValues.Spread)
  ];

  constructor(character: TokenCharacter, operatorType: OperatorType | null = null) {
    super(character);
    if (operatorType) {
      this.type = operatorType;
    }
  }

  public parse(character: TokenCharacter): ParseTokenResult {

    const nextCharacter = character.value;
    const firstCharacter = this.value.charCodeAt(0);
    const secondCharacter = this.value.length == 2 ? this.value.charCodeAt(1) : nextCharacter;
    const thirdCharacter = this.value.length == 2 ? nextCharacter : null;

    for (let index = 0; index < OperatorToken.operatorCombinations.length; index++) {
      const combination = OperatorToken.operatorCombinations[index];
      const matches = combination.matches(firstCharacter, secondCharacter, thirdCharacter);
      if (matches != CombinationMatch.Invalid) {
        return this.parseToken(matches, combination, nextCharacter);
      }
    }

    if (isDigitOrLetter(nextCharacter) || this.terminatorValuesContains(nextCharacter)) {
      if (this.value.length == 1 && this.value.charCodeAt(0) == TokenValues.TableSeparator) {
        return {state: 'finished', charProcessed: false, newToken: new TableSeparatorToken(this.firstCharacter)};
      }
    }

    return newParseTokenInvalidResult(`Invalid token at ${character.position}: '${nextCharacter}'`);
  }

  private terminatorValuesContains(value: number) {
    return OperatorToken.terminatorValues.findIndex(terminator => terminator == value) >= 0;
  }

  private parseToken(matches: CombinationMatch, combination: OperatorCombinations, nextCharacter: number): ParseTokenResult  {

    if (matches == CombinationMatch.Incomplete) {
        this.appendValue(nextCharacter);
        return newParseTokenInProgressResult();
    }

    this.type = combination.type;

    if (matches == CombinationMatch.Complete)
    {
        this.appendValue(nextCharacter);
    }

    return newParseTokenFinishedResult(matches == CombinationMatch.Complete);
  }

  public endOfLine(): ParseTokenResult {

    if (this.value.length == 1 && this.value.charCodeAt(0) == TokenValues.TableSeparator) {
      return newParseTokenFinishedResult(false, new TableSeparatorToken(this.firstCharacter));
    }

    const firstCharacter = this.value.charCodeAt(0);
    const secondCharacter = this.value.length > 1 ? this.value.charCodeAt(1) : null;
    const thirdCharacter = this.value.length > 2 ? this.value.charCodeAt(2) : null;

    for (let index = 0; index < OperatorToken.operatorCombinations.length; index++) {

      let combination = OperatorToken.operatorCombinations[index];
      let matches = combination.matches(firstCharacter, secondCharacter, thirdCharacter);

      if (matches == CombinationMatch.Complete || matches == CombinationMatch.CompleteNotProcessed) {
        this.type = combination.type;
        return newParseTokenFinishedResult(true);
      }
    }

    return newParseTokenInvalidResult(`Incomplete token: '${this.value}'`);
  }
}