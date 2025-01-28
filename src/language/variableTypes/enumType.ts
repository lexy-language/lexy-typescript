import type {IRootNode} from "../rootNode";
import type {IValidationContext} from "../../parser/validationContext";
import type {IRootNodeList} from "../rootNodeList";

import {TypeWithMembers} from "./typeWithMembers";
import {EnumDefinition} from "../enums/enumDefinition";
import {VariableType} from "./variableType";
import {any, firstOrDefault} from "../../infrastructure/enumerableExtensions";
import {VariableTypeName} from "./variableTypeName";

export function instanceOfEnumType(object: any): object is EnumType {
  return object?.variableTypeName == VariableTypeName.EnumType;
}

export function asEnumType(object: any): EnumType | null {
  return instanceOfEnumType(object) ? object as EnumType : null;
}

export class EnumType extends TypeWithMembers {

  public readonly variableTypeName = VariableTypeName.EnumType;

  public type: string;
  public enum: EnumDefinition;

  constructor(type: string, enumDefinition: EnumDefinition) {
    super();
    this.type = type;
    this.enum = enumDefinition;
  }

  public override equals(other: VariableType | null): boolean {
    return other != null && instanceOfEnumType(other) && this.type == other.type;
  }

  public toString(): string {
    return this.type;
  }

  public override memberType(name: string, context: IValidationContext): VariableType | null {
    return any(this.enum.members, member => member.name == name) ? this : null;
  }

  public getDependencies(rootNodeList: IRootNodeList): Array<IRootNode> {
    const enumDefinition = rootNodeList.getEnum(this.type);
    return enumDefinition != null ? [enumDefinition] : [];
  }

  public firstMemberName() {
    return firstOrDefault(this.enum.members)?.name;
  }
}
