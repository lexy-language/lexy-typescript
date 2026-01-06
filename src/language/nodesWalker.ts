import {INode} from "./node";

export class NodesWalker {

   public static walkNodes(nodes: Array<INode>, action: (node : INode) => void): void {
     for (const node of nodes) {
       NodesWalker.walk(node, action);
     }
   }

   public static walk(node: INode, action: (node : INode) => void): void {

     action(node);

     let children = node.getChildren();
     NodesWalker.walkNodes(children, action);
   }
}
