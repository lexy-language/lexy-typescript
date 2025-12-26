import type {INode} from "../language/node";

export interface ITreeValidationVisitor {
  enter(node: INode): void;
  leave(node: INode): void;
}