import type {IValidationContext} from "../validationContext";
import type {ILiteralToken} from "./ILiteralToken";

import {Token} from "./token";
import {TokenCharacter} from "./tokenCharacter";
import {TokenValues} from "./tokenValues";
import {VariableType} from "../../language/variableTypes/variableType";
import {PrimitiveType} from "../../language/variableTypes/primitiveType";
import {TokenType} from "./tokenType";

export function instanceOfBooleanLiteral(object: any): boolean {
  return object?.tokenType == TokenType.BooleanLiteralToken;
}

export function asBooleanLiteral(object: any): BooleanLiteralToken | null {
  return instanceOfBooleanLiteral(object) ? object as BooleanLiteralToken : null;
}

export class BooleanLiteralToken extends Token implements ILiteralToken {
  public booleanValue: boolean;

  public tokenIsLiteral: boolean = true;
  public tokenType = TokenType.BooleanLiteralToken;

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

  public static parse(value: string, character: TokenCharacter): BooleanLiteralToken {
    switch (value) {
      case TokenValues.BooleanTrue:
        return new BooleanLiteralToken(true, character);
      case TokenValues.BooleanFalse:
        return new BooleanLiteralToken(false, character);
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