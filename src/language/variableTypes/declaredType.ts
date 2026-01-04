import type {IComponentNode} from "../componentNode";
import type {IComponentNodeList} from "../componentNodeList";
import type {ITypeDefinition} from "../types/typeDefinition";

import {TypeWithMembers} from "./typeWithMembers";
import {VariableType} from "./variableType";
import {firstOrDefault} from "../../infrastructure/arrayFunctions";
import {VariableTypeName} from "./variableTypeName";

export function instanceOfDeclaredType(object: any): object is DeclaredType {
  return object?.variableTypeName == VariableTypeName.DeclaredType;
}

export function asDeclaredType(object: any): DeclaredType | null {
  return instanceOfDeclaredType(object) ? object as DeclaredType : null;
}

export class DeclaredType extends TypeWithMembers {

  public readonly variableTypeName = VariableTypeName.DeclaredType;
  public type: string;
  public typeDefinition: ITypeDefinition;

  constructor(type: string, typeDefinition: ITypeDefinition) {
    super();
    this.type = type;
    this.typeDefinition = typeDefinition;
  }

  public override equals(other: VariableType | null): boolean {
    return other != null && instanceOfDeclaredType(other) && this.type == other.type;
  }

  public toString(): string {
    return this.type;
  }

  public override memberType(name: string, componentNodes: IComponentNodeList): VariableType | null {
    const definition = firstOrDefault(this.typeDefinition.variables, variable => variable.name == name);
    const variableType = definition?.type.variableType;
    return variableType ? variableType : null;
  }

  public getDependencies(componentNodes: IComponentNodeList): Array<IComponentNode> {
    return [this.typeDefinition];
  }
}