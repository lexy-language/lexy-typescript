import {INode} from "../node";
import {AssignmentDefinition} from "./assignmentDefinition";

export interface IAssignmentDefinition extends INode {
  flatten(result: Array<AssignmentDefinition>): void;
}