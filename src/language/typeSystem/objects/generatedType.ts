import type {IComponentNode} from "../../componentNode";
import type {IComponentNodeList} from "../../componentNodeList";

import {Type} from "../type";
import {GeneratedTypeSource} from "./generatedTypeSource";
import {TypeKind} from "../typeKind";
import {ObjectType} from "./objectType";
import {ObjectVariable} from "./objectVariable";

export function instanceOfGeneratedType(object: any): object is GeneratedType {
  return object?.typeKind == TypeKind.GeneratedType;
}

export function asGeneratedType(object: any): GeneratedType | null {
  return instanceOfGeneratedType(object) ? object as GeneratedType : null;
}

export class GeneratedType extends ObjectType {

  public typeKind = TypeKind.GeneratedType;
  public objectType = true;
  public source: GeneratedTypeSource;
  public node: IComponentNode;

  constructor(name: string, node: IComponentNode, source: GeneratedTypeSource, members: Array<ObjectVariable>) {
    super(name, members);
    this.node = node;
    this.source = source;
  }

  public equals(other: Type | null): boolean {
    return other != null && instanceOfGeneratedType(other) && this.name == other.name && this.source == other.source;
  }

  public getDependencies(componentNodes: IComponentNodeList): Array<IComponentNode> {
    return [this.node];
  }
}
