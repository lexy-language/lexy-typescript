import {Token} from "./token";
import {TokenType} from "./tokenType";
import {ILiteralToken} from "./ILiteralToken";
import {TokenCharacter} from "./tokenCharacter";
import {TokenValues} from "./tokenValues";
import {Assert} from "../../infrastructure/assert";
import {IValidationContext} from "../context/validationContext";
import {Type} from "../../language/typeSystem/type";

export function instanceOfIncompleteMemberAccessToken(object: any): boolean {
  return object?.tokenType == TokenType.IncompleteMemberAccessToken;
}

export function asIncompleteMemberAccessToken(object: any): IncompleteMemberAccessToken | null {
  return instanceOfIncompleteMemberAccessToken(object) ? object as IncompleteMemberAccessToken : null;
}

export class IncompleteMemberAccessToken extends Token implements ILiteralToken {

  public tokenType = TokenType.IncompleteMemberAccessToken;
  public tokenIsLiteral: boolean = true;
  public parts: string[];

  public override value: string;

  public get typedValue(): any {
    return this.parts;
  }

  constructor(value: string, character: TokenCharacter) {
    super(character);
    this.value = Assert.notNull(value, "value");
    this.parts = value.split(TokenValues.MemberAccessString);
  }

  public deriveType(context: IValidationContext): Type | null {
    return null;
  }

  public toString(): string {
    return "unknown: " + this.value;
  }
}
