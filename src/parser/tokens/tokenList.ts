import {Token} from "./token";

import type {ILiteralToken} from "./ILiteralToken";
import {OperatorType} from "./operatorType";

import type {IOperatorToken} from "./operatorToken";
import {TokenType} from "./tokenType";
import {Line} from "../line";
import {Assert} from "../../infrastructure/assert";
import {SourceReference} from "../../language/sourceReference";

export class TokenList {

  private readonly values: Array<Token>;

  public readonly line: Line;

  public get length(): number {
    return this.values.length;
  }

  constructor(line: Line, values: Array<Token>) {
    this.line = Assert.notNull(line, "line");
    this.values = values;
  }

  public get(index: number): Token {
    return this.values[index];
  }

  public asArray(): Array<Token> {
    return [...this.values];
  }

  public isComment(): boolean {
    return this.values.length == 1 && this.values[0].tokenType == "CommentToken";
  }

  public tokenAt(column: number): Token | null {

    const columnIndex = column - 1;
    for (let index = 0; index < this.values.length; index++) {
      const token = this.values[index];
      if (index == this.values.length - 1) {
        if (columnIndex >= token.firstCharacter.position && columnIndex <= token.endColumn + 1) {
          return token;
        }
      } else if (token.firstCharacter.position >= columnIndex && token.endColumn + 1 <= columnIndex) {
        return token;
      }
    }

    return null;
  }

  public tokenValue(index: number): string | null {
    return index >= 0 && index <= this.values.length - 1 ? this.values[index].value : null;
  }

  public tokensFrom(index: number): TokenList {
    if (index == this.values.length) return new TokenList(this.line, []);
    this.checkValidTokenIndex(index);
    return this.tokensRange(index, this.values.length - 1);
  }

  public tokensFromStart(count: number): TokenList {
    return this.tokensRange(0, count - 1);
  }

  public tokensRange(start: number, last: number): TokenList {
    let range = this.values.slice(start, last + 1)

    return new TokenList(this.line, range);
  }

  public isTokenType(index: number, type: TokenType): boolean {
    return index >= 0 && index <= this.values.length - 1 && this.values[index].tokenType == type;
  }

  public token<T extends Token>(index: number, castFunction: (object: any) => T | null): T | null {
    this.checkValidTokenIndex(index);
    return castFunction(this.values[index]);
  }

  public literalToken(index: number): ILiteralToken | null {
    this.checkValidTokenIndex(index);

    return index >= 0
        && index <= this.values.length - 1
        && this.values[index].tokenIsLiteral
          ? this.values[index] as unknown as ILiteralToken
          : null;
  }

  public isLiteralToken(index: number): boolean {
    return index >= 0 && index <= this.values.length - 1 && this.values[index].tokenIsLiteral;
  }

  public isQuotedString(index: number): boolean {
    return index >= 0 && index <= this.values.length - 1 && this.values[index].tokenType == 'QuotedLiteralToken';
  }

  public isKeyword(index: number, keyword: string): boolean {
    return index >= 0
        && index <= this.values.length - 1
        && this.values[index].tokenType == 'KeywordToken'
        && this.values[index]?.value == keyword;
  }

  public isOperatorToken(index: number, type: OperatorType): boolean {
    return index >= 0
        && index <= this.values.length - 1
        && this.values[index].tokenType == 'OperatorToken'
        && (this.values[index] as any as IOperatorToken).type == type;
  }

  public operatorToken(index: number): IOperatorToken | null {
    return index >= 0
        && index <= this.values.length - 1
        && this.values[index].tokenType == 'OperatorToken'
          ? this.values[index] as any as IOperatorToken
          : null;
  }

  public toString(): string {
    let builder = new Array<string>();
    this.values.map(value => {
      builder.push(`${value.tokenType}('${value.value}') `);
    })
    return builder.join('');
  }

  private checkValidTokenIndex(index: number) {
    if (index < 0 || index >= this.values.length)
      throw new Error(`Invalid token index ${index} (length: ${this.values.length})`);
  }

  public characterColumn(tokenIndex: number): number | null {
    if (tokenIndex < 0 || tokenIndex >= this.values.length) return null;

    return this.values[tokenIndex].firstCharacter.position;
  }

  public lastColumn(): number {
    return this.values[this.values.length - 1].endColumn;
  }

  public find<T extends Token>(func: ((where: T) => boolean), tokenType: TokenType): number {
    for (let index = 0; index < this.values.length; index++) {
      let value = this.values[index];
      if (value.tokenType == tokenType) {
        return index;
      }
    }

    return -1;
  }

  public reference(tokenIndex: number, numberOfTokens: number | null = null): SourceReference {

    Assert.true(numberOfTokens == null || numberOfTokens >= 1, `numberOfTokens should be >= 1 (${numberOfTokens})`);

    const characterColumn = this.characterColumn(tokenIndex);
    const column = characterColumn != null ? characterColumn + 1 : 1;
    if (column == null) {
      throw new Error("TokenReference: " + tokenIndex);
    }

    let endColumn = numberOfTokens != null
      ? this.characterColumn(tokenIndex + numberOfTokens)
      : this.lastColumn() ;
    endColumn = endColumn == null ? this.line.content.length : endColumn + 1;

    return this.createReference(column, endColumn);
  }

  public allReference(): SourceReference {
    if (this.length == 0) {
      return this.createReference(1, this.line.content.length + 1);
    }

    let column = this.values[0].firstCharacter.position + 1;
    let columnEnd = this.values[this.length - 1].endColumn + 1;
    return this.createReference(column, columnEnd);
  }

  private createReference(column: number, endColumn: number) {
    return new SourceReference(this.line.fileName ?? "runtime", this.line.index + 1, column, endColumn);
  }
}
