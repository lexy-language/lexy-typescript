import {AssignmentDefinition} from "./assignmentDefinition";
import {IAssignmentDefinition} from "./assignmentDefinition";

export function flattenAssignments(values: Array<IAssignmentDefinition>) {
  const result: Array<AssignmentDefinition> = [];
  for (const value of values) {
    value.flatten(result);
  }
  return result;
}