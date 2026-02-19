import type {IParseLineContext} from "../../parser/context/parseLineContext";
import type {INode} from "../node";
import type {IValidationContext} from "../../parser/context/validationContext";
import type {IAssignmentDefinition} from "./assignmentDefinition";

import {instanceOfParsableNode, IParsableNode, ParsableNode} from "../parsableNode";
import {AssignmentDefinition} from "./assignmentDefinition";
import {SourceReference} from "../sourceReference";
import {NodeType} from "../nodeType";
import {flattenAssignments} from "./flattenAssignments";
import {AssignmentDefinitionParser} from "./assignmentDefinitionParser";
import {NodeReference} from "../nodeReference";
import {Scenario} from "./scenario";
import {SymbolKind} from "../symbols/symbolKind";
import {Symbol} from "../symbols/symbol";

export class Parameters extends ParsableNode {

  private assignmentsValue: Array<IAssignmentDefinition> = [];

  public nodeType = NodeType.Parameters;

  constructor(parent: Scenario, reference: SourceReference) {
    super(new NodeReference(parent), reference);
  }

  public override parse(context: IParseLineContext): IParsableNode {
    let assignment = AssignmentDefinitionParser.parse(context, this);
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

  public override getSymbol(): Symbol {
    return new Symbol(this.reference, "parameters", "Scenario parameter variables used to execute the function", SymbolKind.Keyword);
  }

  public override toString(): string {
    return this.assignmentsValue.length.toString();
  }
}
