import type {IComponentNode} from "../language/componentNode";
import type {INode} from "../language/node";
import type {IComponentNodeList} from "../language/componentNodeList";

import {asHasNodeDependencies} from "../language/IHasNodeDependencies";
import {Assert} from "../infrastructure/assert";
import {NodeDependencies} from "./dependencyNode";
import {contains} from "../infrastructure/arrayFunctions"

export interface CircularReference {
  node: IComponentNode
  referencedNode: IComponentNode
}

export class Dependencies {

  private readonly componentNodes: IComponentNodeList;
  private readonly circularReferencesValue: Map<string, CircularReference> = new Map();
  private readonly nodeDependencies: Map<string, NodeDependencies> = new Map();

  private readonly nodesToProcess: Map<string, IComponentNode> = new Map();

  private sortedNodesValue: readonly IComponentNode[] = [];


  public get hasCircularReferences(): boolean {
    return this.circularReferencesValue.size > 0
  };

  public get sortedNodes(): readonly IComponentNode[]  {
    return this.sortedNodesValue;
  }

  public get nodes(): Map<string, NodeDependencies>  {
    return this.nodeDependencies;
  }

  public get circularReferences(): Map<string, CircularReference> {
    return this.circularReferencesValue;
  }

  constructor(componentNodes: IComponentNodeList) {
    this.componentNodes = componentNodes;
  }

  public build(): void {
    this.processNodes();
    this.checkCircularDependencies();
    this.sortedNodesValue = this.sortNodesBeforeItsDependants();
  }

  public nodeAndDependencies(node: IComponentNode): Array<IComponentNode> {
    const dependencies = this.getOrCreateNodeDependencies(node);
    return !dependencies
      ? [node]
      : [node, ...this.flatten(dependencies.dependencies.values())];
  }

  private processNodes(): void {

    function first(nodesToProcess: Map<string, IComponentNode>): IComponentNode {
      let iterator = nodesToProcess[Symbol.iterator]()
        .next() as IteratorResult<[string, IComponentNode], undefined>;
      if (!iterator.value) {
        throw new Error("Element expected");
      }
      let [_, value] = iterator.value;
      return value;
    }

    for (const node of this.componentNodes.values) {
      this.processNode(node);
    }

    while (this.nodesToProcess.size > 0) {
      const node = first(this.nodesToProcess);
      this.nodesToProcess.delete(node.name)
      this.processNode(node);
    }
  }

  private processNode(componentNode: IComponentNode): void {

    const nodeDependencies = this.getOrCreateNodeDependencies(componentNode);
    if (nodeDependencies == null) return;

    const nodeDependenciesNodes = this.getDependencies(componentNode);
    for (let dependency of nodeDependenciesNodes.values())
    {
      if (!this.nodesToProcess.has(dependency.name)
       && !this.nodeDependencies.has(dependency.name)) {
        this.nodesToProcess.set(dependency.name, dependency);
      }

      let dependencyNodeDependencies = this.getOrCreateNodeDependencies(dependency);
      if (dependencyNodeDependencies) {
        dependencyNodeDependencies.addDependant(componentNode);
      }
    }

    nodeDependencies.addDependencies(nodeDependenciesNodes.values());
  }

  private getOrCreateNodeDependencies(node: IComponentNode): NodeDependencies | null {

    if (node.name == null) return null;

    let value = this.nodeDependencies.get(node.name);
    if (value != undefined) return value;

    value = new NodeDependencies(node);
    this.nodeDependencies.set(node.name, value);
    return value;
  }

  private getDependencies(node: INode): Map<string, IComponentNode> {
    const resultDependencies = new Map<string, IComponentNode>();
    this.processNodeDependencies(node, resultDependencies);
    return resultDependencies;
  }

  private processNodeDependencies(childNode: INode, resultDependencies: Map<string, IComponentNode>) {

    this.getNodeDependencies(childNode, resultDependencies);
    let children = childNode.getChildren();
    for (let child of children) {
      this.processNodeDependencies(child, resultDependencies);
    }
  }

  private getNodeDependencies(childNode: INode, resultDependencies: Map<string, IComponentNode>)  {

    let nodeWithDependencies = asHasNodeDependencies(childNode);
    if (nodeWithDependencies == null) return;

    let nodeDependencies = nodeWithDependencies.getDependencies(this.componentNodes);

    for (let dependency of nodeDependencies) {
      if (!resultDependencies.has(dependency.name)) {
        resultDependencies.set(dependency.name, dependency);
      }
    }
  }

  private checkCircularDependencies(): void {
    for (const [key, value] of this.nodeDependencies) {
      if (this.circularReferencesValue.has(key)) continue;
      const circularReference = this.isCircular(value.node, null, [value.name], value)
      if (circularReference != null) {
        this.circularReferencesValue.set(key, circularReference);
      }
    }
  }

  private isCircular(root: IComponentNode, referencedNode: IComponentNode | null, visited: string[], dependant: NodeDependencies): CircularReference | null {
    for (const [key, node] of dependant.dependants) {
      if (contains(visited, key)) {
        return {node: root, referencedNode: referencedNode ?? root};
      }

      let dependencyNodeDependencies = Assert.notNull(this.nodeDependencies.get(key), "dependencyNodeDependencies");
      const visited1 = [...visited, key]
      const reference = this.isCircular(root, referencedNode ?? node, visited1, dependencyNodeDependencies)
      if (reference != null) {
        return reference;
      }
    }
    return null;
  }

  private flatten(dependencies: MapIterator<IComponentNode>): Array<IComponentNode> {
    const result: Array<IComponentNode> = [];
    this.flattenNodes(result, dependencies);
    return result;
  }

  private flattenNodes(result: Array<IComponentNode>, nodes: MapIterator<IComponentNode>): void {
    for (const node of nodes) {
      if (result.indexOf(node) >= 0) continue;
      result.push(node);

      const dependencies = this.getOrCreateNodeDependencies(node);
      if (dependencies) {
        this.flattenNodes(result, dependencies.dependencies.values());
      }
    }
  }

  private sortNodesBeforeItsDependants(): readonly IComponentNode[] {

    if (this.hasCircularReferences) return this.componentNodes.values;

    const result: Array<IComponentNode> = []

    const processing: Array<string> = this.nodesWithoutDependants();

    while (processing.length > 0) {
      const nodeName = processing.shift() as string;
      const dependencyNode = Assert.notNull(this.nodeDependencies.get(nodeName), "nodeDependencies");

      result.unshift(dependencyNode.node);

      dependencyNode.dependencies.forEach(dependency => {
        const dependant = this.getOrCreateNodeDependencies(dependency);
        if (!dependant) throw new Error("Invalid dependency: " + dependency);
        const occurrence = dependant.decreaseOccurrence();
        if (occurrence == 1) {
          processing.push(dependency.name);
        }
      });
    }
    return result;
  }

  private nodesWithoutDependants(): Array<string> {
    let result: string[] = [];
    for (const [key, value] of this.nodeDependencies) {
      if (value.dependants.size == 0) {
        result.push(key)
      }
    }
    return result;
  }
}
