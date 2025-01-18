import {instanceOfParsableNode, IParsableNode, ParsableNode} from "../parsableNode";
import {AssignmentDefinition, instanceOfAssignmentDefinition} from "./assignmentDefinition";
import {SourceReference} from "../../parser/sourceReference";
import {IParseLineContext} from "../../parser/ParseLineContext";
import {INode} from "../node";
import {IValidationContext} from "../../parser/validationContext";
import {NodeType} from "../nodeType";
import {ComplexAssignmentDefinition} from "./complexAssignmentDefinition";

export class ScenarioResults extends ParsableNode {

  private assignmentsValue: Array<AssignmentDefinition | ComplexAssignmentDefinition> = [];

  public nodeType = NodeType.ScenarioResults;

  public get assignments(): ReadonlyArray<AssignmentDefinition | ComplexAssignmentDefinition> {
    return this.assignmentsValue;
  }

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
}
