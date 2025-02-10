import type {IRootNode} from "../language/rootNode";
import type {INode} from "../language/node";

import {RootNodeList} from "../language/rootNodeList";
import {DependencyNode} from "./dependencyNode";
import {asHasNodeDependencies} from "../language/IHasNodeDependencies";
import {firstOrDefault} from "../infrastructure/arrayFunctions";
import {Assert} from "../infrastructure/assert";
import {NodesWalker} from "../language/nodesWalker";

export class Dependencies {
  private readonly rootNodes: RootNodeList;
  private readonly circularReferencesValue: Array<IRootNode> = [];
  private readonly dependencyMap: Map<string, DependencyNode> = new Map();
  private readonly nodesMap: Map<string, IRootNode> = new Map();
  private readonly nodeOccurrences: Map<string, number> = new Map();
  private readonly dependencyNodesValue: Array<DependencyNode> = []
  private readonly nodesToProcess: Array<IRootNode>;
  private sortedNodesValue: Array<IRootNode> = [];

  public get sortedNodes(): Array<IRootNode>  {
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

  constructor(rootNodes: RootNodeList) {
    this.rootNodes = rootNodes;
    this.nodesToProcess = this.rootNodes.asArray();
  }

  public build(): void {
    this.processNodes();
    this.checkCircularDependencies();
    this.sortedNodesValue = this.topologicalSort();
  }

  public nodeAndDependencies(node: IRootNode): Array<IRootNode> {
    const dependencyNode = this.dependencyMap.get(node.nodeName);
    if (dependencyNode == null) return [];
    return [node, ...this.flatten(dependencyNode.dependencies)];
  }

  private processNodes(): void {
    while (this.nodesToProcess.length > 0) {
      const node = this.nodesToProcess.shift() as IRootNode;
      const dependencyNode = this.processNode(node);
      this.dependencyNodesValue.push(dependencyNode);
      this.dependencyMap.set(node.nodeName, dependencyNode);
      this.nodesMap.set(node.nodeName, node);
    }
  }

  private processNode(rootNode: IRootNode): DependencyNode {
    this.increaseOccurrence(rootNode);
    return this.newDependencyNode(rootNode);
  }

  private increaseOccurrence(rootNode: IRootNode) {
    let key = rootNode.nodeName;
    const existingOccurrences = this.nodeOccurrences.get(key);
    if (existingOccurrences != undefined) {
      this.nodeOccurrences.set(key, existingOccurrences + 1);
    } else {
      this.nodeOccurrences.set(key, 1);
    }
  }

  private newDependencyNode(rootNode: IRootNode): DependencyNode {
    const dependencies = this.getDependencies(rootNode);
    return new DependencyNode(rootNode.nodeName, rootNode, dependencies);
  }

  private getDependencies(node: INode): ReadonlyArray<string> {
    const resultDependencies = new Array<string>();
    NodesWalker.walk(node, childNode => this.processDependencies(childNode, resultDependencies));
    return resultDependencies;
  }

  private processDependencies(childNode: INode, resultDependencies: Array<string>) {
    let nodeDependencies = asHasNodeDependencies(childNode)?.getDependencies(this.rootNodes);
    if (nodeDependencies == null) return;

    for (const dependency of nodeDependencies) {
      this.validateDependency(resultDependencies, dependency);
    }
  }

  private validateDependency(resultDependencies: Array<string>, dependency: IRootNode): void {
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

      const dependency = Assert.notNull(firstOrDefault(this.dependencyNodes,
          where => where.name == dependencyNode.name), "dependency");
      if (node.name == dependency.name) return true;
      if (this.isCircular(node, dependency)) return true;
    }
    return false;
  }

  private flatten(dependencies: ReadonlyArray<string>): Array<IRootNode> {
    const result: Array<IRootNode> = [];
    this.flattenNodes(result, dependencies);
    return this.sortedNodes.filter(where => result.indexOf(where) >= 0);
  }

  private flattenNodes(result: Array<IRootNode>, dependencies: ReadonlyArray<string>): void {
    for (const dependency of dependencies) {
      const dependencyNode = this.dependencyMap.get(dependency);
      if (result.indexOf(dependencyNode.node) >= 0) continue;
      result.push(dependencyNode.node);
      this.flattenNodes(result, dependencyNode.dependencies);
    }
  }

  private topologicalSort(): Array<IRootNode> {

    if (this.hasCircularReferences) return this.rootNodes.asArray()

    const result: Array<IRootNode> = []
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
