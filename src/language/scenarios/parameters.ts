import {instanceOfParsableNode, IParsableNode, ParsableNode} from "../parsableNode";
import {AssignmentDefinition} from "./assignmentDefinition";
import {SourceReference} from "../../parser/sourceReference";
import {IParseLineContext} from "../../parser/ParseLineContext";
import {INode} from "../node";
import {IValidationContext} from "../../parser/validationContext";
import {NodeType} from "../nodeType";
import {IAssignmentDefinition} from "./IAssignmentDefinition";
import {flattenAssignments} from "./flattenAssignments";

export class Parameters extends ParsableNode {

  private assignmentsValue: Array<IAssignmentDefinition> = [];

  public nodeType = NodeType.ScenarioParameters;

  constructor(reference: SourceReference) {
    super(reference);
  }

  public override parse(context: IParseLineContext): IParsableNode {
    let assignment = AssignmentDefinition.parse(context);
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