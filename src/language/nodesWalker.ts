import {INode} from "./node";

type WalkerFunction =  (node : INode) => void
type WalkerWithParentFunction =  (node : INode, parent: INode | null) => void

export class NodesWalker {

   public static walkNodes(nodes: readonly INode[], action: WalkerFunction): void {
     for (const node of nodes) {
       NodesWalker.walk(node, action);
     }
   }

   public static walk(node: INode, action: WalkerFunction): void {

     action(node);

     let children = node.getChildren();
     NodesWalker.walkNodes(children, action);
   }

  public static walkNodesWithParent(nodes: readonly INode[], action: WalkerWithParentFunction, parent: INode | null): void {
    for (const node of nodes) {
      NodesWalker.walkWithParent(node, action, parent);
    }
  }

  public static walkWithParent(node: INode, action: WalkerWithParentFunction, parent: INode | null): void {

    action(node, parent);

    let children = node.getChildren();
    NodesWalker.walkNodesWithParent(children, action, node);
  }
}
