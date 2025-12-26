import type {IComponentNode} from "../componentNode";
import type {IValidationContext} from "../../parser/validationContext";
import type {IComponentNodeList} from "../componentNodeList";

import {TypeWithMembers} from "./typeWithMembers";
import {EnumDefinition} from "../enums/enumDefinition";
import {VariableType} from "./variableType";
import {any, firstOrDefault} from "../../infrastructure/arrayFunctions";
import {VariableTypeName} from "./variableTypeName";
import {SourceReference} from "../../parser/sourceReference";
import {SourceFile} from "../../parser/sourceFile";

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

  public override memberType(name: string, componentNodes: IComponentNodeList): VariableType | null {
    return any(this.enum.members, member => member.name == name) ? this : null;
  }

  public getDependencies(componentNodeList: IComponentNodeList): Array<IComponentNode> {
    const enumDefinition = componentNodeList.getEnum(this.type);
    return enumDefinition != null ? [enumDefinition] : [];
  }

  public firstMemberName() {
    return firstOrDefault(this.enum.members)?.name;
  }

  static Generic() {
    return new EnumType("generic", new EnumDefinition("generic", new SourceReference(new SourceFile("generic"), 1, 1)));
  }
}
