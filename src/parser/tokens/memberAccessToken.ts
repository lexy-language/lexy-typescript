import type {ILiteralToken} from "./ILiteralToken";
import type {IValidationContext} from "../context/validationContext";

import {Token} from "./token";
import {TokenCharacter} from "./tokenCharacter";
import {TokenValues} from "./tokenValues";
import {IdentifierPath} from "../../language/identifierPath";
import {asObjectType} from "../../language/typeSystem/objects/objectType";
import {Type} from "../../language/typeSystem/type";
import {TokenType} from "./tokenType";

export function instanceOfMemberAccessToken(object: any): boolean {
  return object?.tokenType == TokenType.MemberAccessToken;
}

export function asMemberAccessToken(object: any): MemberAccessToken | null {
  return instanceOfMemberAccessToken(object) ? object as MemberAccessToken : null;
}

export class MemberAccessToken extends Token implements ILiteralToken {

  public tokenIsLiteral: boolean = true;
  public tokenType = TokenType.MemberAccessToken;

  public get parent(): string {
    return this.parts.length >= 1 ? this.parts[0] : '';
  }

  public get member(): string {
    return this.parts.length >= 2 ? this.parts[1] : '';
  }

  public readonly parts: string[];
  public value: string;

  public get typedValue() {
    return this.value;
  }

  constructor(value: string, character: TokenCharacter) {
    super(character);
    this.value = value;
    this.parts = value.split(TokenValues.MemberAccessString);
  }

  public deriveType(context: IValidationContext): Type | null {
    let identifierPath = new IdentifierPath(this.parts);
    let type = context.variableContext.getTypeByPath(identifierPath);
    if (type != null) return type;

    if (this.parts.length != 2) return null;

    const componentType = context.componentNodes.getType(this.parent);
    const objectType = asObjectType(componentType);
    if (objectType == null) return null
    return objectType.memberType(this.member);
  }

  public toString() {
    return this.value;
  }
}
