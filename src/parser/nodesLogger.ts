import type {IComponentNode} from "../language/componentNode";
import type {INode} from "../language/node";
import {NodeType} from "../language/nodeType";

export class NodesLogger {
   private readonly builder: string[] = [];
   private indent: number = 0;

   public log(nodes: Array<INode>): void {
     for (const node of nodes) {
        this.logNode(node);
     }
   }

   private logNode(node: INode): void {
     this.builder.push(' '.repeat(this.indent));

     if (node == null) {
       throw new Error("node.getChildren should never return null.")
     } else {
       const componentNode = this.asComponentNode(node)
       if (componentNode != null) {
         this.builder.push(`${componentNode.nodeType}: ${componentNode.nodeName}`);
       } else {
         this.builder.push(node.nodeType);
       }
     }
     this.builder.push("\n")

     const children = node.getChildren();

     this.indent += 2;
     this.log(children);
     this.indent -= 2;
   }

   public toString(): string {
     return this.builder.join('');
   }

  private instanceOfComponentNode(object: any): object is IComponentNode {
    return object?.isComponentNode == true;
  }

  private asComponentNode(object: any): IComponentNode | null {
    return this.instanceOfComponentNode(object) ? object as IComponentNode : null;
  }
}
