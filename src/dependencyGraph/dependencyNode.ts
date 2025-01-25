import {INode} from "../language/node";
import {IRootNode} from "../language/rootNode";

export class DependencyNode {
  private readonly dependenciesValue: Array<DependencyNode> = [];
  private readonly parentNode: DependencyNode | null;
  private readonly nodeValue: IRootNode;

  public name: string
  public type: string

  public get dependencies(): ReadonlyArray<DependencyNode> {
    return [...this.dependenciesValue];
  }

  public get node(): IRootNode {
    return this.nodeValue;
  }

  constructor(name: string, type: string, node: IRootNode, parentNode: DependencyNode | null) {
    this.nodeValue = node;
    this.name = name;
    this.type = type;
    this.parentNode = parentNode;
  }

  public addDependency(dependency: DependencyNode): void {
    this.dependenciesValue.push(dependency);
  }

  protected equals(other: DependencyNode): boolean {
    return this.name == other.name && this.type == other.type;
  }

  public existsInLineage(name: string, type: string): boolean {
    if (this.name == name && this.type == type) return true;
    return this.parentNode != null && this.parentNode.existsInLineage(name, type);
  }
}
