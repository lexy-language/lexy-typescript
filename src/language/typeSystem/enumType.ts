import type {IComponentNode} from "../componentNode";
import type {IComponentNodeList} from "../componentNodeList";

import {ObjectType} from "./objects/objectType";
import {EnumDefinition} from "../enums/enumDefinition";
import {Type} from "./type";
import {firstOrDefault} from "../../infrastructure/arrayFunctions";
import {TypeKind} from "./typeKind";
import {ObjectVariable} from "./objects/objectVariable";
import {IObjectMember} from "./objects/objectMember";
import {SourceReference} from "../sourceReference";
import {Symbol} from "../symbols/symbol";
import {SymbolKind} from "../symbols/symbolKind";

export function instanceOfEnumType(object: any): object is EnumType {
  return object?.typeKind == TypeKind.EnumType;
}

export function asEnumType(object: any): EnumType | null {
  return instanceOfEnumType(object) ? object as EnumType : null;
}

export class EnumType extends ObjectType {

  public readonly typeKind = TypeKind.EnumType;

  public enum: EnumDefinition;

  constructor(enumDefinition: EnumDefinition) {
    super(enumDefinition.name);
    this.enum = enumDefinition;
  }

  public getDependencies(componentNodes: IComponentNodeList): Array<IComponentNode> {
    return [this.enum];
  }

  public override isAssignableFrom(type: Type): boolean {
    return this.equals(type);
  }

  public firstMemberName() {
    return firstOrDefault(this.enum.members)?.name;
  }

  public override equals(other: Type | null): boolean {
    return other != null && instanceOfEnumType(other) && this.name == other.name;
  }

  protected override createMembers(): IObjectMember[] {
    return this.enum.members.map(member => new ObjectVariable(member.name, this));
  }

  public override toString(): string  {
    return this.name;
  }

  public override getSymbol(reference: SourceReference): Symbol {
    return new Symbol(reference, `enum: ${this.name}`, "", SymbolKind.Enum);
  }
}
