import type {IComponentNode} from "../componentNode";
import type {IComponentNodeList} from "../componentNodeList";
import type {IObjectTypeVariable} from "./objectTypeVariable";
import type {IObjectTypeFunction} from "./objectTypeFunction";

import {VariableType} from "./variableType";
import {GeneratedTypeSource} from "./generatedTypeSource";
import {VariableTypeName} from "./variableTypeName";
import {firstOrDefault} from "../../infrastructure/arrayFunctions";
import {ObjectType} from "./objectType";

export function instanceOfGeneratedType(object: any): object is GeneratedType {
  return object?.variableTypeName == VariableTypeName.GeneratedType;
}

export function asGeneratedType(object: any): GeneratedType | null {
  return instanceOfGeneratedType(object) ? object as GeneratedType : null;
}

export class GeneratedType extends ObjectType {

  public variableTypeName = VariableTypeName.GeneratedType;
  public objectType = true;
  public name: string;
  public node: IComponentNode;
  public source: GeneratedTypeSource;
  public members: Array<IObjectTypeVariable>

  constructor(name: string, node: IComponentNode, source: GeneratedTypeSource, members: Array<IObjectTypeVariable>) {
    super();
    this.name = name;
    this.node = node;
    this.source = source;
    this.members = members;
  }

  public memberType(name: string, componentNodes: IComponentNodeList): VariableType | null {
    for (let index = 0; index < this.members.length; index++) {
      const member = this.members[index];
      if (member.name == name) {
        return member.type;
      }
    }
    return null;
  }

  override getVariables(): ReadonlyArray<IObjectTypeVariable> {
    return this.members;
  }

  public override getVariable(name: string): IObjectTypeVariable | null {
    return firstOrDefault(this.members, variable => variable.name == name);
  }

  public override getFunction(name: string): IObjectTypeFunction | null {
    return null;
  }

  public equals(other: VariableType | null): boolean {
    return other != null && instanceOfGeneratedType(other) && this.name == other.name && this.source == other.source;
  }

  public toString() {
    return this.name;
  }
}