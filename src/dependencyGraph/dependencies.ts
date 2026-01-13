import type {IComponentNode} from "../language/componentNode";
import type {INode} from "../language/node";
import type {IComponentNodeList} from "../language/componentNodeList";

import {DependencyNode} from "./dependencyNode";
import {asHasNodeDependencies} from "../language/IHasNodeDependencies";
import {Assert} from "../infrastructure/assert";
import {NodesWalker} from "../language/nodesWalker";

export class Dependencies {
  private readonly componentNodes: IComponentNodeList;
  private readonly circularReferencesValue: IComponentNode[] = [];
  private readonly nodesMap: Map<string, IComponentNode> = new Map();
  private readonly nodeOccurrences: Map<string, number> = new Map();
  private readonly dependencyNodesValue: DependencyNode[] = []
  private readonly dependencyMap: Map<string, DependencyNode> = new Map();
  private readonly nodesToProcess: IComponentNode[];
  private sortedNodesValue: readonly IComponentNode[] = [];

  public get sortedNodes(): readonly IComponentNode[]  {
    return this.sortedNodesValue;
  }

  public get dependencyNodes(): ReadonlyArray<DependencyNode>  {
    return this.dependencyNodesValue;
  }

  public get hasCircularReferences() {
    return this.circularReferences.length > 0
  }

  public get circularReferences() {
    return [...this.circularReferencesValue];
  }

  constructor(componentNodes: IComponentNodeList) {
    this.componentNodes = componentNodes;
    this.nodesToProcess = [...this.componentNodes.values];
  }

  public build(): void {
    this.processNodes();
    this.checkCircularDependencies();
    this.sortedNodesValue = this.topologicalSort();
  }

  public nodeAndDependencies(node: IComponentNode): Array<IComponentNode> {
    const dependencyNode = this.dependencyMap.get(node.nodeName);
    if (dependencyNode == null) return [];
    return [node, ...this.flatten(dependencyNode.dependencies)];
  }

  private processNodes(): void {
    while (this.nodesToProcess.length > 0) {
      const node = this.nodesToProcess.shift() as IComponentNode;
      const dependencyNode = this.processNode(node);
      this.dependencyNodesValue.push(dependencyNode);
      this.dependencyMap.set(node.nodeName, dependencyNode);
      this.nodesMap.set(node.nodeName, node);
    }
  }

  private processNode(componentNode: IComponentNode): DependencyNode {
    this.increaseOccurrence(componentNode);
    return this.newDependencyNode(componentNode);
  }

  private increaseOccurrence(componentNode: IComponentNode) {
    let key = componentNode.nodeName;
    const existingOccurrences = this.nodeOccurrences.get(key);
    if (existingOccurrences != undefined) {
      this.nodeOccurrences.set(key, existingOccurrences + 1);
    } else {
      this.nodeOccurrences.set(key, 1);
    }
  }

  private newDependencyNode(componentNode: IComponentNode): DependencyNode {
    const dependencies = this.getDependencies(componentNode);
    return new DependencyNode(componentNode.nodeName, componentNode, dependencies);
  }

  private getDependencies(node: INode): ReadonlyArray<string> {
    const resultDependencies = new Array<string>();
    NodesWalker.walk(node, childNode => this.processDependencies(childNode, resultDependencies));
    return resultDependencies;
  }

  private processDependencies(childNode: INode, resultDependencies: Array<string>) {
    let nodeDependencies = asHasNodeDependencies(childNode)?.getDependencies(this.componentNodes);
    if (nodeDependencies == null) return;

    for (const dependency of nodeDependencies) {
      this.validateDependency(resultDependencies, dependency);
    }
  }

  private validateDependency(resultDependencies: Array<string>, dependency: IComponentNode): void {
    if (resultDependencies.indexOf(dependency.nodeName) >= 0) return;

    if (this.nodesToProcess.indexOf(dependency) < 0 && !this.nodesMap.has(dependency.nodeName)) {
      this.nodesToProcess.push(dependency);
    }

    this.increaseOccurrence(dependency);
    resultDependencies.push(dependency.nodeName);
  }

  private checkCircularDependencies(): void {
    for (const node of this.dependencyNodes) {
      if (this.circularReferencesValue.indexOf(node.node) >= 0) continue;
      if (this.isCircular(node, node)) {
        this.circularReferencesValue.push(node.node);
      }
    }
  }

  private isCircular(node: DependencyNode, parent: DependencyNode) {
    for (const dependencyNode of this.dependencyNodes) {
      if (!(dependencyNode != parent && dependencyNode.hasDependency(parent))) continue;

      if (node.name == dependencyNode.name) return true;
      if (this.isCircular(node, dependencyNode)) return true;
    }
    return false;
  }

  private flatten(dependencies: ReadonlyArray<string>): Array<IComponentNode> {
    const result: Array<IComponentNode> = [];
    this.flattenNodes(result, dependencies);
    return this.sortedNodes.filter(where => result.indexOf(where) >= 0);
  }

  private flattenNodes(result: Array<IComponentNode>, dependencies: ReadonlyArray<string>): void {
    for (const dependency of dependencies) {
      const dependencyNode = Assert.notNull(this.dependencyMap.get(dependency), "dependencyNode");
      if (result.indexOf(dependencyNode.node) >= 0) continue;
      result.push(dependencyNode.node);
      this.flattenNodes(result, dependencyNode.dependencies);
    }
  }

  private topologicalSort(): readonly IComponentNode[] {

    if (this.hasCircularReferences) return this.componentNodes.values;

    const result: Array<IComponentNode> = []
    const processing: Array<string> = [];
    this.nodeOccurrences.forEach((occurrences, node) => {
      if (occurrences == 1) {
        processing.push(node);
      }
    });

    while (processing.length > 0) {
      const nodeName = processing.shift() as string;
      const node = Assert.notNull(this.nodesMap.get(nodeName), "node");
      const dependencyNode = Assert.notNull(this.dependencyMap.get(nodeName), "dependencyNode");

      result.unshift(node);

      dependencyNode.dependencies.forEach(dependency => {
        const occurrence = this.nodeOccurrences.get(dependency)
        if (occurrence == undefined || occurrence < 1) return;

        let newOccurrence = occurrence - 1;
        this.nodeOccurrences.set(dependency, newOccurrence);

        if (newOccurrence == 1) {
          processing.push(dependency);
        }
      });
    }
    return result;
  }
}
