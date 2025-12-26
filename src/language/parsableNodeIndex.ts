import {IParsableNode} from "./parsableNode";
import {asComponentNode, IComponentNode} from "./componentNode";

export class ParsableNodeIndex {

  private values: Array<IParsableNode | null> = new Array<IParsableNode | null>();

  constructor(componentNode: IParsableNode) {
    this.values[0] = componentNode;
  }

  public getCurrentOrDescend(indent: number): IParsableNode | null {
    let node = this.values[indent];
    this.clearPreviousChildren(indent);
    return node;
  }

  private clearPreviousChildren(indent: number) {
    let index = indent + 1;
    while (index < this.values.length && this.values[index++] != null) {
      this.values[index] = null;
    }
  }

  public set(indent: number, node: IParsableNode): void {
    this.values[indent] = node;
  }

  public getParentComponent(indent: number): IComponentNode {
    while (indent >= 0) {
      let componentNode = asComponentNode(this.values[indent--]);
      if (componentNode != null) {
        return componentNode;
      }
    }
    throw new Error("Can't find an IComponentNode parent.");
  }
}
