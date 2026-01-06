import type {ILiteralToken} from "./ILiteralToken";
import type {IValidationContext} from "../validationContext";

import {Token} from "./token";
import {TokenCharacter} from "./tokenCharacter";
import {TokenValues} from "./tokenValues";
import {IdentifierPath} from "../../language/identifierPath";
import {asObjectType, instanceOfObjectType, IObjectType} from "../../language/variableTypes/objectType";
import {VariableType} from "../../language/variableTypes/variableType";
import {TokenType} from "./tokenType";

export function instanceOfMemberAccessLiteralToken(object: any): boolean {
  return object?.tokenType == TokenType.MemberAccessLiteralToken;
}

export function asMemberAccessLiteralToken(object: any): MemberAccessLiteralToken | null {
  return instanceOfMemberAccessLiteralToken(object) ? object as MemberAccessLiteralToken : null;
}

export class MemberAccessLiteralToken extends Token implements ILiteralToken {

  public tokenIsLiteral: boolean = true;
  public tokenType = TokenType.MemberAccessLiteralToken;

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

  public deriveType(context: IValidationContext): VariableType | null {
    let identifierPath = new IdentifierPath(this.parts);
    let variableType = context.variableContext.getVariableTypeByPath(identifierPath, context);
    if (variableType != null) return variableType;

    if (this.parts.length != 2) return null;

    const componentType = context.componentNodes.getType(this.parent);
    const objectType = asObjectType(componentType);
    if (objectType == null) return null
    return objectType.memberType(this.member, context.componentNodes);
  }

  public toString() {
    return this.value;
  }
}