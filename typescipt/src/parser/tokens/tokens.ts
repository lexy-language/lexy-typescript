import {PrimitiveType, VariableType} from "../../language/variableTypes";
import {Keywords} from "../Keywords";
import {formatLine} from "../../formatting/formatLine";
import {TokenValues} from "./tokenValues";
import {
  newParseTokenFinishedResult,
  newParseTokenInProgressResult,
  newParseTokenInvalidResult,
  ParseTokenResult
} from "./parseTokenResult";
import {ParsableToken} from "./parsableToken";
import {IValidationContext} from "./IValidationContext";
import {ILiteralToken} from "./ILiteralToken";
import {OperatorType} from "./operatorType";
import {TokenCharacter} from "./tokenCharacter";
import {Token} from "./token";

export const KnownTokens: Array<{value: number, factory: ((character: TokenCharacter) => ParsableToken)}> = [
  {value: TokenValues.CommentChar, factory: value => new CommentToken(value)},
  {value: TokenValues.Quote, factory: value => new QuotedLiteralToken(value)},

  {value: TokenValues.Assignment, factory: value => new OperatorToken(value)},
  {value: TokenValues.Addition, factory: value => new OperatorToken(value)},
  {value: TokenValues.Subtraction, factory: value => new OperatorToken(value)},
  {value: TokenValues.Multiplication, factory: value => new OperatorToken(value)},
  {value: TokenValues.Division, factory: value => new OperatorToken(value)},
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

const digit0 = '0'.charCodeAt(0);
const digit9 = '9'.charCodeAt(0);
const letterSmallA = 'a'.charCodeAt(0);
const letterSmallZ = 'z'.charCodeAt(0);
const letterA = 'A'.charCodeAt(0);
const point = '.'.charCodeAt(0);
const colon = ':'.charCodeAt(0);
const letterZ = 'Z'.charCodeAt(0);
const space = ' '.charCodeAt(0);
const tab =  '\t'.charCodeAt(0);

function isDigit(value: Character) {
  return value >= digit0 && value <= digit9;
}

function isCharacter(value: Character) {
  return (value >= letterSmallA && value <= letterSmallZ)
    || (value >= letterA && value <= letterZ);
}

function isDigitOrLetter(value: Character) {
  return isDigit(value) || isCharacter(value);
}

function isWhitespace(value: Character) {
  return value == space || value == tab;
}

export const TokensValidators: Array<{
  isValid: ((character: Character) => boolean),
  factory: ((character: TokenCharacter) => ParsableToken)}> = [
  { isValid: isDigit, factory: value => new NumberLiteralToken(null, value) },
  { isValid: isCharacter, factory: value => new BuildLiteralToken(value) },
  { isValid: isWhitespace, factory: value => new WhitespaceToken(value) },
];

export type Character = number;

class OperatorCombinations {
  public firstChar: Character;
  public secondChar: Character | null;
  public type: OperatorType;
  
  constructor(firstChar: Character, secondChar: Character | null, type: OperatorType) {
    this.firstChar = firstChar;
    this.secondChar = secondChar;
    this.type = type;
  }
}

export class OperatorToken extends ParsableToken {

  public tokenIsLiteral = false;
  public tokenType = 'OperatorToken';
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
    new OperatorCombinations(TokenValues.Assignment, null, OperatorType.Assignment),
    new OperatorCombinations(TokenValues.Addition, null, OperatorType.Addition),
    new OperatorCombinations(TokenValues.Subtraction, null, OperatorType.Subtraction),
    new OperatorCombinations(TokenValues.Multiplication, null, OperatorType.Multiplication),
    new OperatorCombinations(TokenValues.Division, null, OperatorType.Division),
    new OperatorCombinations(TokenValues.Modulus, null, OperatorType.Modulus),
    new OperatorCombinations(TokenValues.OpenParentheses, null, OperatorType.OpenParentheses),
    new OperatorCombinations(TokenValues.CloseParentheses, null, OperatorType.CloseParentheses),
    new OperatorCombinations(TokenValues.OpenBrackets, null, OperatorType.OpenBrackets),
    new OperatorCombinations(TokenValues.CloseBrackets, null, OperatorType.CloseBrackets),
    new OperatorCombinations(TokenValues.GreaterThan, null, OperatorType.GreaterThan),
    new OperatorCombinations(TokenValues.LessThan, null, OperatorType.LessThan),
    new OperatorCombinations(TokenValues.ArgumentSeparator, null, OperatorType.ArgumentSeparator),
    new OperatorCombinations(TokenValues.GreaterThan, TokenValues.Assignment, OperatorType.GreaterThanOrEqual),
    new OperatorCombinations(TokenValues.LessThan, TokenValues.Assignment, OperatorType.LessThanOrEqual),
    new OperatorCombinations(TokenValues.Assignment, TokenValues.Assignment, OperatorType.Equals),
    new OperatorCombinations(TokenValues.NotEqualStart, TokenValues.Assignment, OperatorType.NotEqual),
    new OperatorCombinations(TokenValues.And, TokenValues.And, OperatorType.And),
    new OperatorCombinations(TokenValues.Or, TokenValues.Or, OperatorType.Or)
  ];

  constructor(character: TokenCharacter) {
    super(character);
    let operatorValue = character.value;
    OperatorToken.operatorCombinations.forEach (combination => {
      if (!combination.secondChar && combination.firstChar == operatorValue)
        this.type = combination.type;
    });
  }

  private terminatorValuesContains(value: number) {
    return OperatorToken.terminatorValues.findIndex(terminator => terminator == value) >= 0;
  }

  public parse(character: TokenCharacter): ParseTokenResult
  {
    let value = character.value;
    if (this.value.length == 1) {

      for (let index = 0; index < OperatorToken.operatorCombinations.length; index++) {
        let combination = OperatorToken.operatorCombinations[index];
        if (combination.secondChar
          && combination.secondChar == value
          && combination.firstChar == this.value.charCodeAt(0)) {
          this.type = combination.type;
          return newParseTokenFinishedResult(true);
        }
      }
    }

    if (isDigitOrLetter(value) || this.terminatorValuesContains(value)) {
      if (this.value.length == 1 && this.value.charCodeAt(0) == TokenValues.TableSeparator) {
        return {state: 'finished', charProcessed: false, newToken: new TableSeparatorToken(this.firstCharacter)};
      }
    }
    return {state: 'finished', charProcessed: false, newToken: null};
  }

  public finalize(): ParseTokenResult
  {
    if (this.value.length == 1 && this.value.charCodeAt(0) == TokenValues.TableSeparator) {
      return {state: 'finished', charProcessed: false, newToken: new TableSeparatorToken(this.firstCharacter)};
    }

    return {state: 'finished', charProcessed: false, newToken: null};
  }
}

export class NumberLiteralToken extends ParsableToken implements ILiteralToken
{
  private allowedNextTokensValues = [
    TokenValues.TableSeparator,
    TokenValues.Space,
    TokenValues.Assignment,

    TokenValues.Addition,
    TokenValues.Subtraction,
    TokenValues.Multiplication,
    TokenValues.Division,
    TokenValues.Modulus,
    TokenValues.CloseParentheses,
    TokenValues.CloseBrackets,
    TokenValues.GreaterThan,
    TokenValues.LessThan,
    TokenValues.ArgumentSeparator
  ];

  private hasDecimalSeparator: boolean = false;
  private numberValueValue: number | null;

  public tokenIsLiteral: boolean = true;
  public tokenType: string = 'NumberLiteralToken';

  public get numberValue(): number {
    if (this.numberValueValue == null) throw new Error("NumberLiteralToken not finalized.");
    return this.numberValueValue;
  }

  constructor(value: number | null, character: TokenCharacter) {
    super(character);
    this.numberValueValue = value;
  }

  public get value() {
    return this.numberValue != null
      ? this.numberValue.toString()
      : super.value;
  }

  public get typedValue() {
    return this.numberValue;
  }

  public deriveType(context: IValidationContext): VariableType {
    return PrimitiveType.number;
  }

  public parse(character: TokenCharacter): ParseTokenResult
  {
    let value = character.value;
    if (isDigit(value)) {
      this.appendValue(value);
      return newParseTokenInProgressResult();
    }

    if (value == TokenValues.DecimalSeparator) {
      if (this.hasDecimalSeparator) {
        return {state: 'invalid', validationError: "Only one decimal separator expected"};
      }

      this.hasDecimalSeparator = true;
      this.appendValue(value);
      return newParseTokenInProgressResult();
    }

    return this.allowedNextTokensValues.findIndex(allowed => allowed == value) >= 0
      ? this.finalize()
      : newParseTokenInvalidResult(`Invalid number token character: '${String.fromCharCode(value)}'`);
  }

  public finalize(): ParseTokenResult {
    this.numberValueValue = parseFloat(super.value);
    return newParseTokenFinishedResult(false);
  }

  public isDecimal(): boolean {
    return this.numberValue != null && this.numberValue % 1 != 0;
  }

  public toString(): string{
    return this.value;
  }
}

export enum TokenStatus {
  InProgress,
  Finished,
  InvalidToken
}

export class CommentToken extends ParsableToken {

  public tokenIsLiteral: boolean = false;
  public tokenType: string = 'CommentToken';

  constructor(character: TokenCharacter)
  {
    super(character);
  }

  public parse(character: TokenCharacter) : ParseTokenResult {
    this.appendValue(character.value);
    return newParseTokenInProgressResult();
  }

  public finalize() : ParseTokenResult {
    return newParseTokenFinishedResult(true);
  }
}

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

class BuildLiteralToken extends ParsableToken  {

  private static terminatorValues = [
    TokenValues.Space,
    TokenValues.OpenParentheses,
    TokenValues.OpenBrackets,
    TokenValues.CloseParentheses,
    TokenValues.CloseBrackets,
    TokenValues.ArgumentSeparator
  ];

  public tokenIsLiteral: boolean = false;
  public tokenType: string = 'BuildLiteralToken';

  private hasMemberAccessor: boolean = false;
  private lastMemberAccessor : boolean = false;

  constructor(character: TokenCharacter) {
   super(character);
  }

  public parse(character: TokenCharacter): ParseTokenResult {
    let value = character.value;

    if (BuildLiteralToken.terminatorValues.findIndex(terminator => terminator == value) >= 0) {
      return newParseTokenFinishedResult(false, this.sealLiteral());
    }

    if (value == point)
    {
      if (this.lastMemberAccessor) {
        return newParseTokenInvalidResult(
          `Unexpected character: '${String.fromCharCode(value)}'. Member accessor should be followed by member name.`);
      }

      this.hasMemberAccessor = true;
      this.lastMemberAccessor = true;
      this.appendValue(value);

      return newParseTokenInProgressResult();
    }

    if (isDigitOrLetter(value) || value == colon) {
      this.lastMemberAccessor = false;

      this.appendValue(value);
      return newParseTokenInProgressResult();
    }

    if (value == TokenValues.Quote && this.value == TokenValues.DateTimeStarter)
      return newParseTokenInProgressResult(new DateTimeLiteral(this.firstCharacter));

    return newParseTokenInvalidResult(`Unexpected character: '${String.fromCharCode(value)}'`);
  }

  public finalize(): ParseTokenResult {
    if (this.lastMemberAccessor)
      return newParseTokenInvalidResult(
        "Unexpected end of line. Member accessor should be followed by member name.");

    return newParseTokenFinishedResult(true, this.sealLiteral());
  }

  private sealLiteral(): Token
  {
    let value = this.value;
    if (Keywords.contains(value)) return new KeywordToken(value, this.firstCharacter);
    if (BooleanLiteral.isValid(value)) return BooleanLiteral.parse(value, this.firstCharacter);

    if (this.hasMemberAccessor) return new MemberAccessLiteral(value, this.firstCharacter);

    return new StringLiteralToken(value, this.firstCharacter);
  }
}

export class WhitespaceToken extends ParsableToken {

  public tokenIsLiteral: boolean = false;
  public tokenType: string = 'WhitespaceToken';
  
  constructor(character: TokenCharacter) {
    super(character);
  }

  public parse(character: TokenCharacter | null) : ParseTokenResult {
    let value = character != null ? character.value.toString() : '';
    return value != ' ' ? newParseTokenFinishedResult(false) : newParseTokenInProgressResult();
  }

  public finalize() : ParseTokenResult {
    return newParseTokenFinishedResult(true);
  }
}

export class QuotedLiteralToken extends ParsableToken implements ILiteralToken
{
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

  public deriveType(context: IValidationContext): VariableType
  {
    return PrimitiveType.string;
  }

  public parse(character: TokenCharacter): ParseTokenResult
  {
    let value = character.value;
    if (this.quoteClosed) throw new Error("No characters allowed after closing quote.");

    if (value == TokenValues.Quote)
    {
      this.quoteClosed = true;
      return newParseTokenFinishedResult(true, this);
    }

    this.appendValue(value);
    return newParseTokenInProgressResult();
  }

  public finalize(): ParseTokenResult
  {
    if (!this.quoteClosed) return newParseTokenInvalidResult("Closing quote expected.");

    return newParseTokenFinishedResult(true, this);
  }

  public toString()
  {
    return this.value;
  }
}

export class KeywordToken extends Token {

  public tokenIsLiteral: boolean = true;
  public tokenType: string = 'KeywordToken';

  public value: string

  constructor(keyword: string, character: TokenCharacter) {
    super(character);
    this.value = keyword;
  }
}

export class DateTimeLiteral extends ParsableToken implements ILiteralToken {

  //format d"0123/56/89 12:45:78"
  private static readonly DigitIndexes = [ 0, 1, 2, 3, 5, 6, 8, 9, 11, 12, 14, 15, 17, 18 ];
  private static readonly DashIndexes = [ 4, 7 ];
  private static readonly TIndexes = [ 10 ];
  private static readonly ColonIndexes = [ 13, 16  ];
  private static readonly ValidLengths = [ 19 ];
  private readonly validators: ((character: Character) => ParseTokenResult | null)[];

  private index: number = 0;

  public dateTimeValue: Date | null = null;

  public tokenIsLiteral: boolean = true;
  public tokenType: string = 'DateTimeLiteral';

  constructor(character: TokenCharacter) {
    super(character, '');
    this.validators = [
      value => this.validate(value, isDigit(value), DateTimeLiteral.DigitIndexes),
      value => this.validateExact(value, TokenValues.Dash, DateTimeLiteral.DashIndexes),
      value => this.validateExact(value, TokenValues.Colon, DateTimeLiteral.ColonIndexes),
      value => this.validateExact(value, 'T'.charCodeAt(0), DateTimeLiteral.TIndexes)
    ];
  }

  public get typedValue() {
    return this.dateTimeValue as object;
  }

  public deriveType(context: IValidationContext): VariableType {
    return PrimitiveType.date;
  }

  public parse(character: TokenCharacter): ParseTokenResult {
    let value = character.value;
    if (value == TokenValues.Quote)
    {
      if (DateTimeLiteral.ValidLengths.findIndex(item => item == this.value.length) < 0) {
        return newParseTokenInvalidResult(
          `Invalid date time format length '${this.value.length}'. 
          Expected: '${formatLine(DateTimeLiteral.ValidLengths, ',')}'`);
      }

      this.parseValue();
      return newParseTokenFinishedResult(true);
    }

    for (let index = 0 ; index < this.validators.length ; index++) {
      let validator = this.validators[index];
      let result = validator(value);
      if (result != null) {
        this.appendValue(value);
        this.index++;
        return result;
      }
    }

    return newParseTokenInvalidResult(`Unexpected character: '${String.fromCharCode(value)}'. Format: d""2024-12-18T14:17:30""`);
  }

  private parseValue() {
    this.dateTimeValue = new Date(this.value);
  }

  private validateExact(value: number, match: number, indexes: number[]): ParseTokenResult | null
  {
    return this.validate(value, value == match, indexes);
  }

  private validate(value: number, match: boolean, indexes: number[]): ParseTokenResult | null
  {
    if (!match) return null;

    if (indexes.findIndex(where => where == this.index) < 0) {
      return newParseTokenInvalidResult(`Unexpected character: '${String.fromCharCode(value)}'. Format: d"2024-12-18T14:17:30"`);
    }

    return newParseTokenInProgressResult();
  }

  public finalize(): ParseTokenResult {
    return newParseTokenInvalidResult(
      'Unexpected end of line. Closing quote expected. Format: d"2024-12-18T14:17:30"');
  }

  public toString() {
    return this.dateTimeValue != null ? this.dateTimeValue.toISOString() : '';
  }
}

export class BooleanLiteral extends Token implements ILiteralToken
{
  public booleanValue: boolean;

  public tokenIsLiteral: boolean = true;
  public tokenType: string = 'BooleanLiteral';

  constructor(value: boolean, character: TokenCharacter) {
    super(character);
    this.booleanValue = value;
  }

  public get typedValue() {
    return this.booleanValue;
  }

  public get value() {
    return this.booleanValue ? TokenValues.BooleanTrue : TokenValues.BooleanFalse;
  }

  public deriveType(context: IValidationContext): VariableType {
    return PrimitiveType.boolean;
  }

  public static parse(value: string, character: TokenCharacter): BooleanLiteral {
    switch (value) {
      case TokenValues.BooleanTrue:
        return new BooleanLiteral(true, character);
      case TokenValues.BooleanFalse:
        return new BooleanLiteral(false, character);
      default:
        throw new Error(`Couldn't parse boolean: ${value}`)
    }
  }

  public static isValid(value: string): boolean {
    return value == TokenValues.BooleanTrue || value == TokenValues.BooleanFalse;
  }

  public toString(): string {
    return this.value;
  }
}

export class StringLiteralToken extends Token implements ILiteralToken {

  public value: string;

  public tokenIsLiteral: boolean = true;
  public tokenType: string = 'StringLiteralToken';

  constructor(value: string, character: TokenCharacter) {
    super(character);
    this.value = value;
  }

  public get typedValue() {
    return this.value;
  }

  public deriveType(context: IValidationContext): VariableType {
    throw new Error("Not supported. Type should be defined by node or expression.");
  }

  public toString() {
    return this.value;
  }
}

export class MemberAccessLiteral extends Token implements ILiteralToken {

  public get parent() {
    return this.parts.length >= 1 ? this.parts[0] : null;
  }

  public get member() {
    return this.parts.length >= 2 ? this.parts[1] : null;
  }

  public readonly parts: string[];

  public tokenIsLiteral: boolean = true;
  public tokenType: string = 'MemberAccessLiteral';

  constructor(value: string, character: TokenCharacter) {
    super(character);
    this.value = value;
    this.parts = value.split(TokenValues.MemberAccessString);
  }

  public value: string;

  public get typedValue() {
    return this.value;
  }

  public deriveType(context: IValidationContext): VariableType {
    /* let variableReference = new VariableReference(Parts);
    let variableType = context.VariableContext.GetVariableType(variableReference, context);
    if (variableType != null) return variableType;

    if (this.parts.Length != 2) return null;

    let rootType = context.RootNodes.GetType(Parent);
    return rootType is not ITypeWithMembers typeWithMembers ? null : typeWithMembers.MemberType(Member, context);*/
    throw Error("Not implemented.")
  }

  public toString() {
    return this.value;
  }
}