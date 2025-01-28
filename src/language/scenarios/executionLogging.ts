import type {IParseLineContext} from "../../parser/ParseLineContext";
import type {INode} from "../node";
import type {IValidationContext} from "../../parser/validationContext";

import {IParsableNode, ParsableNode} from "../parsableNode";
import {SourceReference} from "../../parser/sourceReference";
import {NodeType} from "../nodeType";
import {ExecutionLog} from "./executionLog";

export class ExecutionLogging extends ParsableNode {

  private entriesValue: Array<ExecutionLog> = [];

  public nodeType = NodeType.ExecutionLogging;

  public get entries() {
    return this.entriesValue;
  }

  constructor(reference: SourceReference) {
    super(reference);
  }

  public override parse(context: IParseLineContext): IParsableNode {
    return this.parseEntry(context);
  }

  private parseEntry(context: IParseLineContext) {
    let entry = ExecutionLog.parse(context);
    if (entry == null) return this;

    this.entriesValue.push(entry);

    return entry;
  }

  public override getChildren(): Array<INode> {
    return [...this.entriesValue];
  }

  protected override validate(context: IValidationContext): void {
  }
}
