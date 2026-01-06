import {VariableType} from "./variableType";
import {VariableTypeName} from "./variableTypeName";
import {IObjectTypeVariable} from "./objectTypeVariable";

export class VoidType extends VariableType {

  public readonly variableTypeName = VariableTypeName.VoidType;

  override isAssignableFrom(type: VariableType): boolean {
    return this.equals(type);
  }

  equals(other: VariableType | null): boolean {
    return this.variableTypeName == other?.variableTypeName;
  }
}
