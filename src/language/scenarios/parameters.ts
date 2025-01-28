import type {IParseLineContext} from "../../parser/ParseLineContext";
import type {INode} from "../node";
import type {IValidationContext} from "../../parser/validationContext";
import type {IAssignmentDefinition} from "./assignmentDefinition";

import {instanceOfParsableNode, IParsableNode, ParsableNode} from "../parsableNode";
import {AssignmentDefinition} from "./assignmentDefinition";
import {SourceReference} from "../../parser/sourceReference";
import {NodeType} from "../nodeType";
import {flattenAssignments} from "./flattenAssignments";
import {AssignmentDefinitionParser} from "./assignmentDefinitionParser";

export class Parameters extends ParsableNode {

  private assignmentsValue: Array<IAssignmentDefinition> = [];

  public nodeType = NodeType.ScenarioParameters;

  constructor(reference: SourceReference) {
    super(reference);
  }

  public override parse(context: IParseLineContext): IParsableNode {
    let assignment = AssignmentDefinitionParser.parse(context);
    if (assignment == null) return this;

    this.assignmentsValue.push(assignment);

    if (instanceOfParsableNode(assignment)) {
      return assignment;
    }
    return this;
  }

  public override getChildren(): Array<INode> {
    return [...this.assignmentsValue];
  }

  protected override validate(context: IValidationContext): void {
  }

  public allAssignments(): Array<AssignmentDefinition> {
    return flattenAssignments(this.assignmentsValue);
  }
}