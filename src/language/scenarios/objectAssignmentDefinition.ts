import type {IParseLineContext} from "../../parser/context/parseLineContext";
import type {INode} from "../node";
import type {IValidationContext} from "../../parser/context/validationContext";
import type {IAssignmentDefinition} from "./assignmentDefinition";
import type {AssignmentDefinitionParserHandler} from "./assignmentDefinitionParser";

import {IdentifierPath} from "../identifierPath";
import {SourceReference} from "../sourceReference";
import {instanceOfParsableNode, IParsableNode, ParsableNode} from "../parsableNode";
import {AssignmentDefinition} from "./assignmentDefinition";
import {NodeType} from "../nodeType";
import {instanceOfGeneratedType} from "../typeSystem/objects/generatedType";
import {instanceOfDeclaredType} from "../typeSystem/objects/declaredType";
import {NodeReference} from "../nodeReference";
import {Symbol} from "../symbols/symbol";
import {AssignmentDefinitionParser} from "./assignmentDefinitionParser";

export function instanceOfObjectAssignmentDefinition(object: any): object is ObjectAssignmentDefinition {
  return object?.nodeType == NodeType.ObjectAssignmentDefinition;
}

export function asObjectAssignmentDefinition(object: any): ObjectAssignmentDefinition | null {
  return instanceOfObjectAssignmentDefinition(object) ? object as ObjectAssignmentDefinition : null;
}

export class ObjectAssignmentDefinition extends ParsableNode implements IAssignmentDefinition {

  private assignmentsValue: Array<IAssignmentDefinition> = [];

  public readonly variable: IdentifierPath;

  public nodeType = NodeType.ObjectAssignmentDefinition;

  public get assignments(): ReadonlyArray<IAssignmentDefinition> {
    return this.assignmentsValue;
  }

  constructor(variable: IdentifierPath, parentReference: NodeReference, reference: SourceReference) {
    super(parentReference, reference);
    this.variable = variable;
  }

  public override parse(context: IParseLineContext): IParsableNode {
    let assignment = AssignmentDefinitionParser.parse(context, this, this.variable);
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
    if (!context.variableContext.containsPath(this.variable)) {
      context.logger.fail(this.reference, `Variable '${this.variable}' not found.`);
    }

    const type = context.variableContext.getTypeByPath(this.variable);
    if (!instanceOfDeclaredType(type) && !instanceOfGeneratedType(type)) {
      context.logger.fail(this.reference, `Variable '${this.variable}' without assignment should be a object type, but is ${type}.`);
    }
  }

  flatten(result: Array<AssignmentDefinition>) {
    for (const assignment of this.assignmentsValue) {
      assignment.flatten(result);
    }
  }

  public override getSymbol(): Symbol | null {
    return null;
  }

  public toString() {
    return this.variable.toString();
  }
}
