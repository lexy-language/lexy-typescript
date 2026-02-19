import type {IObjectMember} from "./objectMember";
import type {IComponentNodeList} from "../../componentNodeList";
import type {IComponentNode} from "../../componentNode";

import {Type} from "../type";
import {asObjectFunction, ObjectFunction} from "./objectFunction";
import {asObjectVariable, ObjectVariable} from "./objectVariable";
import {any, firstOrDefault, ofType} from "../../../infrastructure/arrayFunctions";
import {IHasNodeDependencies} from "../../IHasNodeDependencies";

export function instanceOfObjectType(object: any): object is ObjectType {
  return !!object?.isObjectType;
}

export function asObjectType(object: any): ObjectType | null {
  return instanceOfObjectType(object) ? object as ObjectType : null;
}

export abstract class ObjectType extends Type implements IHasNodeDependencies{

  private membersValue: IObjectMember[] | null;

  public readonly hasNodeDependencies = true;
  public readonly isObjectType = true;

  public readonly name: string;

  public get members(): IObjectMember[] {
    if (this.membersValue == null) {
      this.membersValue = this.createMembers();
    }
    return this.membersValue;
  }

  protected constructor(name: string, members: IObjectMember[] | null = null) {
    super();
    this.name = name;
    this.membersValue = members;
  }

  public memberType(name: string): Type | null {
    let member = this.getMember(name);
    return member ? member.type : null;
  }

  public getFunction(name: string) {
    return asObjectFunction(this.getMember(name));
  }

  public getMember(name: string): IObjectMember | null {
    return firstOrDefault(this.members, member => member.name == name);
  }

  public containsMember(name: string) {
    return any(this.members, member => member.name == name);
  }

  public override isAssignableFrom(type: Type): boolean {

    const otherObjectType = asObjectType(type);
    if (otherObjectType == null) return false;

    return otherObjectType.typeKind == this.typeKind
        && otherObjectType.name == this.name;
  }

  public toString() {
    return this.name;
  }

  public getDependencies(componentNodes: IComponentNodeList): IComponentNode[]  {
    return [];
  }

  protected createMembers(): IObjectMember[] {
    throw new Error("Derived classes should provide members by constructor or by overriding this method.");
  }
}
