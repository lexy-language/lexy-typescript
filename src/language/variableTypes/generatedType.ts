import type {ITypeWithMembers} from "./ITypeWithMembers";
import type {IComponentNode} from "../componentNode";

import {VariableType} from "./variableType";
import {GeneratedTypeMember} from "./generatedTypeMember";
import {GeneratedTypeSource} from "./generatedTypeSource";
import {VariableTypeName} from "./variableTypeName";
import {IComponentNodeList} from "../componentNodeList";
import {IInstanceFunction} from "../functions/IInstanceFunction";

export function instanceOfGeneratedType(object: any): object is GeneratedType {
  return object?.variableTypeName == VariableTypeName.GeneratedType;
}

export function asGeneratedType(object: any): GeneratedType | null {
  return instanceOfGeneratedType(object) ? object as GeneratedType : null;
}

export class GeneratedType extends VariableType implements ITypeWithMembers {

  public variableTypeName = VariableTypeName.GeneratedType;
  public typeWithMember = true;
  public name: string;
  public node: IComponentNode;
  public source: GeneratedTypeSource;
  public members: Array<GeneratedTypeMember>

  constructor(name: string, node: IComponentNode, source: GeneratedTypeSource, members: Array<GeneratedTypeMember>) {
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

  getFunction(name: string): IInstanceFunction | null {
    return null;
  }

  public equals(other: VariableType | null): boolean {
    return other != null && instanceOfGeneratedType(other) && this.name == other.name && this.source == other.source;
  }

  public toString() {
    return "(GeneratedType) " + this.name;
  }

}
