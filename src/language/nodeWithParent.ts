import {INode} from "./node";

export function instanceOfParent(object: any): object is INodeWithParent {
  return object?.isNodeWithParent == true;
}

export function asNodeWithParent(object: any): INodeWithParent | null {
  return instanceOfParent(object) ? object as INodeWithParent : null;
}

export interface INodeWithParent {
  isNodeWithParent: true;
  setParent(node: INode): void;
}
