import type {ITypeWithMembers} from "./ITypeWithMembers";
import type {IComponentNode} from "../componentNode";

import {VariableType} from "./variableType";
import {ComplexTypeMember} from "./complexTypeMember";
import {ComplexTypeSource} from "./complexTypeSource";
import {VariableTypeName} from "./variableTypeName";
import {IComponentNodeList} from "../componentNodeList";

export function instanceOfComplexType(object: any): object is ComplexType {
  return object?.variableTypeName == VariableTypeName.ComplexType;
}

export function asComplexType(object: any): ComplexType | null {
  return instanceOfComplexType(object) ? object as ComplexType : null;
}

export class ComplexType extends VariableType implements ITypeWithMembers {

  public variableTypeName = VariableTypeName.ComplexType;
  public typeWithMember = true;
  public name: string;
  public node: IComponentNode;
  public source: ComplexTypeSource;
  public members: Array<ComplexTypeMember>

  constructor(name: string, node: IComponentNode, source: ComplexTypeSource, members: Array<ComplexTypeMember>) {
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

  public equals(other: VariableType | null): boolean {
    return other != null && instanceOfComplexType(other) && this.name == other.name && this.source == other.source;
  }

  public toString() {
    return "(ComplexType) " + this.name;
  }
}
