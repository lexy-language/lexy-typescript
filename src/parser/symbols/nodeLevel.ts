import {INode} from "../../language/node";

export class NodeLevel {
  public value: INode;
  public level: number;

  constructor(value: INode, level: number) {
    this.value = value;
    this.level = level;
  }
}
