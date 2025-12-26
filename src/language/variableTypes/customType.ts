import type {IComponentNode} from "../componentNode";
import type {IValidationContext} from "../../parser/validationContext";
import type {IComponentNodeList} from "../componentNodeList";
import type {ITypeDefinition} from "../types/typeDefinition";

import {TypeWithMembers} from "./typeWithMembers";
import {VariableType} from "./variableType";
import {firstOrDefault} from "../../infrastructure/arrayFunctions";
import {VariableTypeName} from "./variableTypeName";

export function instanceOfCustomType(object: any): object is CustomType {
  return object?.variableTypeName == VariableTypeName.CustomType;
}

export function asCustomType(object: any): CustomType | null {
  return instanceOfCustomType(object) ? object as CustomType : null;
}

export class CustomType extends TypeWithMembers {

  public readonly variableTypeName = VariableTypeName.CustomType;
  public type: string;
  public typeDefinition: ITypeDefinition;

  constructor(type: string, typeDefinition: ITypeDefinition) {
    super();
    this.type = type;
    this.typeDefinition = typeDefinition;
  }

  public override equals(other: VariableType | null): boolean {
    return other != null && instanceOfCustomType(other) && this.type == other.type;
  }

  public toString(): string {
    return this.type;
  }

  public override memberType(name: string, componentNodes: IComponentNodeList): VariableType | null {
    const definition = firstOrDefault(this.typeDefinition.variables, variable => variable.name == name);
    const variableType = definition?.type.variableType;
    return variableType ? variableType : null;
  }

  public getDependencies(componentNodeList: IComponentNodeList): Array<IComponentNode> {
    return [this.typeDefinition];
  }
}