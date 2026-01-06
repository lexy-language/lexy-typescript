import type {IComponentNode} from "../componentNode";
import type {IComponentNodeList} from "../componentNodeList";

import {ObjectType} from "./objectType";
import {EnumDefinition} from "../enums/enumDefinition";
import {VariableType} from "./variableType";
import {any, firstOrDefault} from "../../infrastructure/arrayFunctions";
import {VariableTypeName} from "./variableTypeName";
import {SourceReference} from "../../parser/sourceReference";
import {SourceFile} from "../../parser/sourceFile";
import {IObjectTypeFunction} from "./objectTypeFunction";
import {IObjectTypeVariable} from "./objectTypeVariable";

export function instanceOfEnumType(object: any): object is EnumType {
  return object?.variableTypeName == VariableTypeName.EnumType;
}

export function asEnumType(object: any): EnumType | null {
  return instanceOfEnumType(object) ? object as EnumType : null;
}

export class EnumType extends ObjectType {

  public readonly variableTypeName = VariableTypeName.EnumType;

  public type: string;
  public enum: EnumDefinition;

  constructor(type: string, enumDefinition: EnumDefinition) {
    super();
    this.type = type;
    this.enum = enumDefinition;
  }

  public toString(): string {
    return this.type;
  }

  public override getVariable(name: string): IObjectTypeVariable | null {
    return null;
  }

  public override getFunction(name: string): IObjectTypeFunction | null {
    return null;
  }

  public override memberType(name: string, componentNodes: IComponentNodeList): VariableType | null {
    return any(this.enum.members, member => member.name == name) ? this : null;
  }

  public getDependencies(componentNodes: IComponentNodeList): Array<IComponentNode> {
    const enumDefinition = componentNodes.getEnum(this.type);
    return enumDefinition != null ? [enumDefinition] : [];
  }

  public override isAssignableFrom(type: VariableType): boolean {
    return this.equals(type);
  }

  public firstMemberName() {
    return firstOrDefault(this.enum.members)?.name;
  }

  public override equals(other: VariableType | null): boolean {
    return other != null && instanceOfEnumType(other) && this.type == other.type;
  }
}
