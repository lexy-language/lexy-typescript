import {VariableReference} from "../variableReference";
import {SourceReference} from "../../parser/sourceReference";
import {instanceOfParsableNode, IParsableNode, ParsableNode} from "../parsableNode";
import {AssignmentDefinition} from "./assignmentDefinition";
import {NodeType} from "../nodeType";
import {IParseLineContext} from "../../parser/ParseLineContext";
import {INode} from "../node";
import {IValidationContext} from "../../parser/validationContext";
import {instanceOfComplexType} from "../variableTypes/complexType";
import {IAssignmentDefinition} from "./IAssignmentDefinition";
import {instanceOfCustomType} from "../variableTypes/customType";

export function instanceOfComplexAssignmentDefinition(object: any): object is ComplexAssignmentDefinition {
  return object?.nodeType == NodeType.ComplexAssignmentDefinition;
}

export function asComplexAssignmentDefinition(object: any): ComplexAssignmentDefinition | null {
  return instanceOfComplexAssignmentDefinition(object) ? object as ComplexAssignmentDefinition : null;
}

export class ComplexAssignmentDefinition extends ParsableNode implements IAssignmentDefinition {

  private assignmentsValue: Array<IAssignmentDefinition> = [];

  private readonly variable: VariableReference;

  public nodeType = NodeType.ComplexAssignmentDefinition;

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
    if (!context.variableContext.containsReference(this.variable, context)) {
      context.logger.fail(this.reference, `Variable '${this.variable}' not found.`);
    }

    const variableType = context.variableContext.getVariableTypeByReference(this.variable, context);
    if (!instanceOfCustomType(variableType)) {
      context.logger.fail(this.reference, `Variable '${this.variable}' without assignment should be a complex type, but is ${variableType}.`);
    }
  }

  flatten(result: Array<AssignmentDefinition>) {
    for (const assignment of this.assignmentsValue) {
      assignment.flatten(result);
    }
  }
}