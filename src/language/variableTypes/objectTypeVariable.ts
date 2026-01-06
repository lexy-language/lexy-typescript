import {VariableType} from "./variableType";

export interface IObjectTypeVariable {
  name: string;
  type: VariableType | null;
}

export class ObjectTypeVariable implements IObjectTypeVariable {
  public name: string;
  public type: VariableType | null;

  constructor(name: string, type: VariableType | null) {
    this.name = name;
    this.type = type;
  }
}