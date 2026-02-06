import type {IParseLineContext} from "../../parser/context/parseLineContext";
import type {INode} from "../node";
import type {IValidationContext} from "../../parser/context/validationContext";
import type {IAssignmentDefinition} from "./assignmentDefinition";

import {instanceOfParsableNode, IParsableNode, ParsableNode} from "../parsableNode";
import {SourceReference} from "../sourceReference";
import {NodeType} from "../nodeType";
import {Keywords} from "../../parser/Keywords";
import {asQuotedLiteralToken} from "../../parser/tokens/quotedLiteralToken";
import {AssignmentDefinition} from "./assignmentDefinition";
import {AssignmentDefinitionParser} from "./assignmentDefinitionParser";
import {NodeReference} from "../nodeReference";
import {Symbol} from "../symbols/symbol";

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

  constructor(message: string, parentReference: NodeReference, reference: SourceReference) {
    super(parentReference, reference);
    this.message = message;
  }

  public override parse(context: IParseLineContext): IParsableNode {
    if (!context.line.tokens.isKeyword(0, Keywords.ExecutionLog)) {
      return this.parseAssignment(context);
    }

    return this.parseEntry(context);
  }

  private parseEntry(context: IParseLineContext) {
    const entry = ExecutionLog.parse(new NodeReference(this), context);
    if (entry == null) return this;

    this.entriesValue.push(entry);

    return entry;
  }

  private parseAssignment(context: IParseLineContext) {
    const assignment = AssignmentDefinitionParser.parse(context, this);
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

  static parse(parentReference: NodeReference, context: IParseLineContext): ExecutionLog | null {
    const line = context.line;
    const tokens = line.tokens;
    const reference = tokens.allReference();

    if (!tokens.isKeyword(0, Keywords.ExecutionLog)) {
      context.logger.fail(tokens.allReference(), "Keyword expected 'Log'");
      return null;
    }

    if (tokens.length != 2) {
      context.logger.fail(tokens.allReference(), "Invalid number of tokens '" + tokens.length + "'. Expected: '2'");
      return null
    }

    const token = context.line.tokens.get(1);
    const messageToken = asQuotedLiteralToken(token);
    if (messageToken == null) {
      context.logger.fail(tokens.allReference(), "Invalid token. \"Message\" expected.");
      return null;
    }

    return new ExecutionLog(messageToken.value, parentReference, reference);
  }

  public override getSymbol(): Symbol | null {
    return null;
  }
}
