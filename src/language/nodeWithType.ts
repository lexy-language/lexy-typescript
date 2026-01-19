import {Type} from "./typeSystem/type";

export function instanceOfNodeWithType(object: any): object is INodeWithType {
  return object?.isNodeWithType == true;
}

export function asNodeWithType(object: any): INodeWithType | null {
  return instanceOfNodeWithType(object) ? object as INodeWithType : null;
}

export interface INodeWithType {
  isNodeWithType: true;
  createType(): Type;
}
