import type {IComponentNode} from "../componentNode";
import type {IComponentNodeList} from "../componentNodeList";
import type {ITypeDefinition} from "../types/typeDefinition";

import {ObjectType} from "./objectType";
import {VariableType} from "./variableType";
import {firstOrDefault} from "../../infrastructure/arrayFunctions";
import {VariableTypeName} from "./variableTypeName";
import {IObjectTypeVariable, ObjectTypeVariable} from "./objectTypeVariable";
import {IObjectTypeFunction} from "./objectTypeFunction";

export function instanceOfDeclaredType(object: any): object is DeclaredType {
  return object?.variableTypeName == VariableTypeName.DeclaredType;
}

export function asDeclaredType(object: any): DeclaredType | null {
  return instanceOfDeclaredType(object) ? object as DeclaredType : null;
}

export class DeclaredType extends ObjectType {

  public readonly variableTypeName = VariableTypeName.DeclaredType;
  public type: string;
  public typeDefinition: ITypeDefinition;

  constructor(type: string, typeDefinition: ITypeDefinition) {
    super();
    this.type = type;
    this.typeDefinition = typeDefinition;
  }

  override getVariables(): ReadonlyArray<IObjectTypeVariable> {
    return this.typeDefinition.variables.map(variable => new ObjectTypeVariable(variable.name, variable.variableType));
  }

  public override getVariable(name: string): IObjectTypeVariable | null {
    const variable = firstOrDefault(this.typeDefinition.variables, variable => variable.name == name);
    return variable != null ? new ObjectTypeVariable(variable.name, variable.variableType) : null;
  }

  public override getFunction(name: string): IObjectTypeFunction | null {
    return null;
  }

  public override memberType(name: string, componentNodes: IComponentNodeList): VariableType | null {
    const definition = firstOrDefault(this.typeDefinition.variables, variable => variable.name == name);
    const variableType = definition?.type.variableType;
    return variableType ? variableType : null;
  }

  public getDependencies(componentNodes: IComponentNodeList): Array<IComponentNode> {
    return [this.typeDefinition];
  }

  public override equals(other: VariableType | null): boolean {
    return other != null && instanceOfDeclaredType(other) && this.type == other.type;
  }

  public toString(): string {
    return this.type;
  }
}