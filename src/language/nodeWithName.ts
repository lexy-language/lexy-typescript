import {INode} from "./node";

export function instanceOfNodeWithName(object: any): object is INodeWithName {
  return object?.isNodeWithName == true;
}

export function asNodeWithName(object: any): INodeWithName | null {
  return instanceOfNodeWithName(object) ? object as INodeWithName : null;
}

export interface INodeWithName extends INode {
  isNodeWithName: true;
  name: string;
}

