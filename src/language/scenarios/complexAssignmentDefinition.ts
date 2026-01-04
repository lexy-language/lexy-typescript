import type {IParseLineContext} from "../../parser/ParseLineContext";
import type {INode} from "../node";
import type {IValidationContext} from "../../parser/validationContext";
import type {IAssignmentDefinition} from "./assignmentDefinition";
import type {AssignmentDefinitionParserHandler} from "./assignmentDefinitionParser";

import {IdentifierPath} from "../identifierPath";
import {SourceReference} from "../../parser/sourceReference";
import {instanceOfParsableNode, IParsableNode, ParsableNode} from "../parsableNode";
import {AssignmentDefinition} from "./assignmentDefinition";
import {NodeType} from "../nodeType";
import {instanceOfGeneratedType} from "../variableTypes/generatedType";
import {instanceOfDeclaredType} from "../variableTypes/declaredType";

export function instanceOfComplexAssignmentDefinition(object: any): object is ComplexAssignmentDefinition {
  return object?.nodeType == NodeType.ComplexAssignmentDefinition;
}

export function asComplexAssignmentDefinition(object: any): ComplexAssignmentDefinition | null {
  return instanceOfComplexAssignmentDefinition(object) ? object as ComplexAssignmentDefinition : null;
}

export class ComplexAssignmentDefinition extends ParsableNode implements IAssignmentDefinition {

  private assignmentsValue: Array<IAssignmentDefinition> = [];

  public readonly variable: IdentifierPath;

  public nodeType = NodeType.ComplexAssignmentDefinition;
  private assignmentDefinitionParser: AssignmentDefinitionParserHandler;

  public get assignments(): ReadonlyArray<IAssignmentDefinition> {
    return this.assignmentsValue;
  }

  constructor(variable: IdentifierPath, reference: SourceReference, assignmentDefinitionParser: AssignmentDefinitionParserHandler) {
    super(reference);
    this.variable = variable;
    this.assignmentDefinitionParser = assignmentDefinitionParser;
  }

  public override parse(context: IParseLineContext): IParsableNode {
    let assignment = this.assignmentDefinitionParser(context, this.variable);
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
    if (!context.variableContext.containsPath(this.variable, context)) {
      context.logger.fail(this.reference, `Variable '${this.variable}' not found.`);
    }

    const variableType = context.variableContext.getVariableTypeByPath(this.variable, context);
    if (!instanceOfDeclaredType(variableType) && !instanceOfGeneratedType(variableType)) {
      context.logger.fail(this.reference, `Variable '${this.variable}' without assignment should be a complex type, but is ${variableType}.`);
    }
  }

  flatten(result: Array<AssignmentDefinition>) {
    for (const assignment of this.assignmentsValue) {
      assignment.flatten(result);
    }
  }
}