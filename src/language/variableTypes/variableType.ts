import type {IComponentNode} from "../componentNode";
import type {IComponentNodeList} from "../componentNodeList";

import {VariableTypeName} from "./variableTypeName";
import {IHasNodeDependencies} from "../IHasNodeDependencies";

export abstract class VariableType implements IHasNodeDependencies {

  public readonly hasNodeDependencies = true;

  public abstract readonly variableTypeName: VariableTypeName;
  public abstract equals(other: VariableType | null): boolean;

  public getDependencies(componentNodes: IComponentNodeList): Array<IComponentNode> {
    return [];
  }
}
