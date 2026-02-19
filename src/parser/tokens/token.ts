import {TokenCharacter} from "./tokenCharacter";
import {TokenType} from "./tokenType";

export function instanceOfToken(object: any): object is Token {
  return !!object?.tokenType;
}

export function asToken(object: any): Token | null {
  return instanceOfToken(object) ? object as Token : null;
}

export interface IToken {
  tokenType: string;
  tokenIsLiteral: boolean;
  firstCharacter: TokenCharacter;
}

export abstract class Token implements IToken {

  private readonly endColumnValue: number | null;

  abstract tokenIsLiteral: boolean;
  abstract tokenType: TokenType;
  abstract value: string;

  public firstCharacter: TokenCharacter;

  public get endColumn(): number {
    return this.endColumnValue
        ?? this.firstCharacter.position + (this.value != null ? this.value.length - 1 : 0);
  }

  protected constructor(firstCharacter: TokenCharacter, endColumn: number | null = null) {
    this.firstCharacter = firstCharacter;
    this.endColumnValue = endColumn;
  }
}
