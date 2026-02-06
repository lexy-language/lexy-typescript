import type {ILiteralToken} from "./ILiteralToken";
import type {IValidationContext} from "../context/validationContext";

import {Token} from "./token";
import {TokenCharacter} from "./tokenCharacter";
import {Type} from "../../language/typeSystem/type";
import {TokenType} from "./tokenType";

export function instanceOfStringLiteralToken(object: any) {
  return object?.tokenType == TokenType.StringLiteralToken;
}

export function asStringLiteralToken(object: any): StringLiteralToken | null {
  return instanceOfStringLiteralToken(object) ? object as StringLiteralToken : null;
}

export class StringLiteralToken extends Token implements ILiteralToken {

  public value: string;

  public tokenIsLiteral: boolean = true;
  public tokenType = TokenType.StringLiteralToken;

  public get typedValue() {
    return this.value;
  }

  constructor(value: string, character: TokenCharacter) {
    super(character);
    this.value = value;
  }

  public deriveType(context: IValidationContext): Type | null {
    throw new Error("Not supported. Type should be defined by node or expression.");
  }

  public toString() {
    return this.value;
  }
}
