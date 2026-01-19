import type {IComponentNode} from "../../componentNode";
import type {IComponentNodeList} from "../../componentNodeList";
import type {ITypeDefinition} from "../../types/typeDefinition";

import {ObjectType} from "./objectType";
import {Type} from "../type";
import {firstOrDefault} from "../../../infrastructure/arrayFunctions";
import {TypeKind} from "../typeKind";
import {ObjectVariable} from "./objectVariable";

export function instanceOfDeclaredType(object: any): object is DeclaredType {
  return object?.typeKind == TypeKind.DeclaredType;
}

export function asDeclaredType(object: any): DeclaredType | null {
  return instanceOfDeclaredType(object) ? object as DeclaredType : null;
}

export class DeclaredType extends ObjectType {

  public readonly typeKind = TypeKind.DeclaredType;
  public typeDefinition: ITypeDefinition;

  constructor(typeDefinition: ITypeDefinition) {
    super(typeDefinition.name);
    this.typeDefinition = typeDefinition;
  }

  public override equals(other: Type | null): boolean {
    return other != null && instanceOfDeclaredType(other) && this.name == other.name;
  }

  public getDependencies(componentNodes: IComponentNodeList): Array<IComponentNode> {
    return [this.typeDefinition];
  }


  public override createMembers() {
    return this.typeDefinition.variables
      .map(variable => new ObjectVariable(variable.name, variable.typeDeclaration.type))
  }
}
