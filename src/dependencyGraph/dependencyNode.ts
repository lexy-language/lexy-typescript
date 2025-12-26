import {IComponentNode} from "../language/componentNode";

export class DependencyNode {
  private readonly dependenciesValue: ReadonlyArray<string> = [];
  private readonly nodeValue: IComponentNode;

  public name: string

  public get dependencies(): ReadonlyArray<string> {
    return this.dependenciesValue;
  }

  public get node(): IComponentNode {
    return this.nodeValue;
  }

  constructor(name: string, node: IComponentNode, dependencies: ReadonlyArray<string>) {
    this.nodeValue = node;
    this.name = name;
    this.dependenciesValue = dependencies;
  }

  hasDependency(parent: DependencyNode) {
    return this.dependenciesValue.indexOf(parent.name) >= 0;
  }
}
