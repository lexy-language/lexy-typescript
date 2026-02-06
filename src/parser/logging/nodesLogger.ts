import type {INode} from "../../language/node";
import {asNodeWithName} from "../../language/nodeWithName";

export class NodesLogger {

  public static log(nodes: readonly INode[], logger: (line: string) => void): void {
    NodesLogger.logNodes(null, nodes, logger, 0);
  }

  private static logNodes(parent: INode | null, nodes: readonly (INode | null)[], logger: (line: string) => void, indent: number): void {
    let index = 0;
    for (const node of nodes) {
      if (node == null) {
        throw new Error(`Node ${index++} of '${parent != null ? parent.nodeType : "null"}' is null.`);
      }
      NodesLogger.logNode(node, logger, indent);
    }
  }

  private static logNode(node: INode | null, logger: (line: string) => void, indent: number): void {

    const indentValue = ' '.repeat(indent);

    if (node == null || !node.getChildren) {
      throw new Error("node.getChildren should never return null.")
    }

    const nodeWithName = asNodeWithName(node)
    if (nodeWithName != null) {
      logger(`${indentValue}${nodeWithName.nodeType}: ${nodeWithName.name}`);
    } else {
      logger(`${indentValue}${node.nodeType}`);
    }

    const children = node.getChildren();
    NodesLogger.logNodes(node, children, logger, indent + 2);
  }
}
