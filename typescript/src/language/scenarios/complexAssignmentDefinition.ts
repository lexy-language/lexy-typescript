import {VariableReference} from "../variableReference";
import {SourceReference} from "../../parser/sourceReference";
import {instanceOfParsableNode, IParsableNode, ParsableNode} from "../parsableNode";
import {AssignmentDefinition} from "./assignmentDefinition";
import {NodeType} from "../nodeType";
import {IParseLineContext} from "../../parser/ParseLineContext";
import {INode} from "../node";
import {IValidationContext} from "../../parser/validationContext";

export function instanceOfComplexAssignmentDefinition(object: any): object is ComplexAssignmentDefinition {
  return object?.nodeType == NodeType.ComplexAssignmentDefinition;
}

export function asComplexAssignmentDefinition(object: any): ComplexAssignmentDefinition | null {
  return instanceOfComplexAssignmentDefinition(object) ? object as ComplexAssignmentDefinition : null;
}

export class ComplexAssignmentDefinition extends ParsableNode {

  private assignmentsValue: Array<AssignmentDefinition | ComplexAssignmentDefinition> = [];

  public nodeType = NodeType.ComplexAssignmentDefinition;
  private variable: VariableReference;

  public get assignments(): ReadonlyArray<AssignmentDefinition | ComplexAssignmentDefinition> {
    return this.assignmentsValue;
  }

  constructor(variable: VariableReference, reference: SourceReference) {
    super(reference);
    this.variable = variable;
  }

  public override parse(context: IParseLineContext): IParsableNode {
    let assignment = AssignmentDefinition.parse(context, this.variable);
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
}