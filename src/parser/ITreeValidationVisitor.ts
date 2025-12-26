import type {INode} from "../language/node";

export interface ITreeValidationVisitor {
  enter(node: INode);
  leave(node: INode);
}