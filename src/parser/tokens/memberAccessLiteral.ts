import type {ILiteralToken} from "./ILiteralToken";
import type {IValidationContext} from "../validationContext";

import {Token} from "./token";
import {TokenCharacter} from "./tokenCharacter";
import {TokenValues} from "./tokenValues";
import {VariablePath} from "../../language/variablePath";
import {instanceOfTypeWithMembers, ITypeWithMembers} from "../../language/variableTypes/ITypeWithMembers";
import {VariableType} from "../../language/variableTypes/variableType";
import {TokenType} from "./tokenType";

export function instanceOfMemberAccessLiteral(object: any): boolean {
  return object?.tokenType == TokenType.MemberAccessLiteral;
}

export function asMemberAccessLiteral(object: any): MemberAccessLiteral | null {
  return instanceOfMemberAccessLiteral(object) ? object as MemberAccessLiteral : null;
}

export class MemberAccessLiteral extends Token implements ILiteralToken {

  public get parent(): string {
    return this.parts.length >= 1 ? this.parts[0] : '';
  }

  public get member(): string {
    return this.parts.length >= 2 ? this.parts[1] : '';
  }

  public readonly parts: string[];

  public tokenIsLiteral: boolean = true;
  public tokenType = TokenType.MemberAccessLiteral;

  constructor(value: string, character: TokenCharacter) {
    super(character);
    this.value = value;
    this.parts = value.split(TokenValues.MemberAccessString);
  }

  public value: string;

  public get typedValue() {
    return this.value;
  }

  public deriveType(context: IValidationContext): VariableType | null {
    let variablePath = new VariablePath(this.parts);
    let variableType = context.variableContext.getVariableTypeByPath(variablePath, context);
    if (variableType != null) return variableType;

    if (this.parts.length != 2) return null;

    let rootType = context.rootNodes.getType(this.parent);
    if (!instanceOfTypeWithMembers(rootType)) return null;
    const typeWithMembers = rootType as ITypeWithMembers;
    return typeWithMembers.memberType(this.member, context.rootNodes);
  }

  public toString() {
    return this.value;
  }
}