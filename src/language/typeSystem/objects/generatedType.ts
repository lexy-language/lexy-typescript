import type {IComponentNode} from "../../componentNode";
import type {IComponentNodeList} from "../../componentNodeList";

import {Type} from "../type";
import {GeneratedTypeSource} from "./generatedTypeSource";
import {TypeKind} from "../typeKind";
import {ObjectType} from "./objectType";
import {ObjectVariable} from "./objectVariable";
import {SourceReference} from "../../sourceReference";
import {Symbol} from "../../symbols/symbol";
import {SymbolKind} from "../../symbols/symbolKind";

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
  public typeName: string;

  constructor(typeName: string, memberName: string, node: IComponentNode, source: GeneratedTypeSource, members: Array<ObjectVariable>) {
    super(`${typeName}.${memberName}`, members);
    this.typeName = typeName;
    this.node = node;
    this.source = source;
  }

  public equals(other: Type | null): boolean {
    return other != null && instanceOfGeneratedType(other) && this.name == other.name && this.source == other.source;
  }

  public getDependencies(componentNodes: IComponentNodeList): Array<IComponentNode> {
    return [this.node];
  }

  public override toString(): string  {
    return this.name;
  }

  public override getSymbol(reference: SourceReference): Symbol {
    return new Symbol(reference, `type: ${this.name}`, "", SymbolKind.GeneratedType);
  }
}
