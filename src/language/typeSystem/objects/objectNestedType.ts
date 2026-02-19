import {IObjectMember, ObjectMemberKind} from "./objectMember";
import {Type} from "../type";
import {ObjectVariable} from "./objectVariable";

export function instanceOfObjectNestedType(object: any): object is ObjectNestedType {
  return object?.kind == ObjectMemberKind.NestedType;
}

export function asObjectNestedType(object: any): ObjectNestedType | null {
  return instanceOfObjectNestedType(object) ? object as ObjectNestedType : null;
}

export class ObjectNestedType implements IObjectMember {

  public kind = ObjectMemberKind.NestedType;
  public name: string;
  public type: Type;

  constructor(name: string, type: Type) {
    this.name = name;
    this.type = type;
  }

  public description() {
    return `type: ${this.type}`;
  }
}
