import {instanceOfParsableNode, IParsableNode, ParsableNode} from "../parsableNode";
import {SourceReference} from "../../parser/sourceReference";
import {IParseLineContext} from "../../parser/ParseLineContext";
import {INode} from "../node";
import {IValidationContext} from "../../parser/validationContext";
import {NodeType} from "../nodeType";
import {Keywords} from "../../parser/Keywords";
import {asQuotedLiteralToken} from "../../parser/tokens/quotedLiteralToken";
import {AssignmentDefinition} from "./assignmentDefinition";
import {IAssignmentDefinition} from "./IAssignmentDefinition";

export class ExecutionLog extends ParsableNode {

  private entriesValue: Array<ExecutionLog> = [];
  private assignmentsValue: Array<IAssignmentDefinition> = [];

  public readonly message: string;

  public get entries() {
    return this.entriesValue;
  }

  public get assignments() {
    return this.assignmentsValue;
  }

  public nodeType = NodeType.ExecutionLogging;

  constructor(message: string, reference: SourceReference) {
    super(reference);
    this.message = message;
  }

  public override parse(context: IParseLineContext): IParsableNode {
    if (!context.line.tokens.isKeyword(0, Keywords.ExecutionLog)) {
      return this.parseAssignment(context);
    }

    return this.parseEntry(context);
  }

  private parseEntry(context: IParseLineContext) {
    let entry = ExecutionLog.parse(context);
    if (entry == null) return this;

    this.entriesValue.push(entry);

    return entry;
  }

  private parseAssignment(context: IParseLineContext) {
    let assignment = AssignmentDefinition.parse(context);
    if (assignment == null) return this;

    this.assignmentsValue.push(assignment);

    if (instanceOfParsableNode(assignment)) {
      return assignment;
    }
    return this;
  }

  public override getChildren(): Array<INode> {
    //assignments should not be validated
    return [...this.entriesValue];
  }

  protected override validate(context: IValidationContext): void {
  }

  static parse(context: IParseLineContext): ExecutionLog | null {
    const line = context.line;
    const tokens = line.tokens;
    const reference = line.lineStartReference();

    if (!tokens.isKeyword(0, Keywords.ExecutionLog)) {
      context.logger.fail(context.line.lineStartReference(), "Keyword expected 'Log'");
      return null;
    }

    if (tokens.length != 2) {
      context.logger.fail(context.line.lineStartReference(), "Invalid number of tokens '" + tokens.length + "'. Expected: '2'");
      return null
    }

    const token = context.line.tokens.get(1);
    const messageToken = asQuotedLiteralToken(token);
    if (messageToken == null) {
      context.logger.fail(context.line.tokenReference(1), "Invalid token. \"Message\" expected.");
      return null;
    }

    return new ExecutionLog(messageToken.value, reference);
  }
}
