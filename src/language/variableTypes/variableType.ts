import type {IRootNode} from "../rootNode";
import type {IRootNodeList} from "../rootNodeList";

import {VariableTypeName} from "./variableTypeName";

export abstract class VariableType {

  public abstract readonly variableTypeName: VariableTypeName;
  public abstract equals(other: VariableType | null): boolean;

  public getDependencies(rootNodeList: IRootNodeList): Array<IRootNode> {
    return [];
  }
}
