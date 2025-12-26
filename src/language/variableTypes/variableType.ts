import type {IComponentNode} from "../componentNode";
import type {IComponentNodeList} from "../componentNodeList";

import {VariableTypeName} from "./variableTypeName";

export abstract class VariableType {

  public abstract readonly variableTypeName: VariableTypeName;
  public abstract equals(other: VariableType | null): boolean;

  public getDependencies(componentNodeList: IComponentNodeList): Array<IComponentNode> {
    return [];
  }
}
