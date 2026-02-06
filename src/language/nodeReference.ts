import {INode} from "./node";

export class NodeReference {

  private isSet: boolean;
  private nodeValue: INode | null;

  public get node(): INode | null {
    if (!this.isSet) throw new Error("Node object reference not set.");
    return this.nodeValue;
  }

  constructor(node: INode | null = null, isSet: boolean | null = null) {
    this.nodeValue = node;
    if (isSet != null) {
      this.isSet = isSet;
    } else {
      this.isSet = node != null;
    }
  }

  public setNode(node: INode): void {
    if (this.isSet) throw new Error("NodeObjectReference can't be set twice.");
    this.nodeValue = node;
    this.isSet = true;
  }
}
