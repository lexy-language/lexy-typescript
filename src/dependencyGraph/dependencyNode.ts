import {IComponentNode} from "../language/componentNode";

export class NodeDependencies {

  private occurrence: number | null = null;

  private readonly dependenciesValue: Map<string, IComponentNode> = new Map();
  private readonly dependantsValue: Map<string, IComponentNode> = new Map();

  public readonly node: IComponentNode;

  public get name(): string { return this.node.nodeName; }

  public get dependencies(): Map<string, IComponentNode> {
    return this.dependenciesValue;
  }

  public get dependants(): Map<string, IComponentNode> {
    return this.dependantsValue;
  }

  constructor(node: IComponentNode) {
    this.node = node;
  }

  public addDependencies(dependencies: MapIterator<IComponentNode>) {
    for (let dependency of dependencies) {
      this.dependencies.set(dependency.nodeName, dependency);
    }
  }

  public addDependant(componentNode: IComponentNode) {
    this.dependants.set(componentNode.nodeName, componentNode);
  }

  public decreaseOccurrence(): number {

    if (this.occurrence == null) {
      this.occurrence = this.dependants.size;
    } else{
      this.occurrence -= 1;
    }

    return this.occurrence;
  }

  public toString(): string {
    return `${this.node.nodeName} (dependencies: ${this.dependencies.size} dependants: ${this.dependants.size})`
  };
}
