import {Token} from "./token";
import {TokenCharacter} from "./tokenCharacter";

export class KeywordToken extends Token {

  public tokenIsLiteral: boolean = true;
  public tokenType: string = 'KeywordToken';

  public value: string

  constructor(keyword: string, character: TokenCharacter) {
    super(character);
    this.value = keyword;
  }
}