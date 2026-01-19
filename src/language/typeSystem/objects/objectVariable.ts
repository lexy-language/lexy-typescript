import {Type} from "../type";
import {IObjectMember, ObjectMemberKind} from "./objectMember";

export function instanceOfObjectVariable(object: any): object is ObjectVariable {
  return object?.kind == ObjectMemberKind.Variable;
}

export function asObjectVariable(object: any): ObjectVariable | null {
  return instanceOfObjectVariable(object) ? object as ObjectVariable : null;
}

export class ObjectVariable implements IObjectMember {

  public kind = ObjectMemberKind.Variable;
  public name: string;
  public type: Type | null;

  constructor(name: string, type: Type | null) {
    this.name = name;
    this.type = type;
  }
}
