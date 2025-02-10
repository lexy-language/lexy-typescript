import {IRootNode} from "../language/rootNode";

export class DependencyNode {
  private readonly dependenciesValue: ReadonlyArray<string> = [];
  private readonly nodeValue: IRootNode;

  public name: string

  public get dependencies(): ReadonlyArray<string> {
    return this.dependenciesValue;
  }

  public get node(): IRootNode {
    return this.nodeValue;
  }

  constructor(name: string, node: IRootNode, dependencies: ReadonlyArray<string>) {
    this.nodeValue = node;
    this.name = name;
    this.dependenciesValue = dependencies;
  }

  hasDependency(parent: DependencyNode) {
    return this.dependenciesValue.indexOf(parent.name) >= 0;
  }
}
