import type {IParseLineContext} from "../../parser/context/parseLineContext";
import type {INode} from "../node";
import type {IValidationContext} from "../../parser/context/validationContext";

import {IParsableNode, ParsableNode} from "../parsableNode";
import {SourceReference} from "../sourceReference";
import {NodeType} from "../nodeType";
import {ExecutionLog} from "./executionLog";
import {Scenario} from "./scenario";
import {NodeReference} from "../nodeReference";
import {Symbol} from "../symbols/symbol";

export class ExecutionLogging extends ParsableNode {

  private entriesValue: Array<ExecutionLog> = [];

  public nodeType = NodeType.ExecutionLogging;

  public get entries() {
    return this.entriesValue;
  }

  constructor(parent: Scenario, reference: SourceReference) {
    super(new NodeReference(parent), reference);
  }

  public override parse(context: IParseLineContext): IParsableNode {
    return this.parseEntry(context);
  }

  private parseEntry(context: IParseLineContext) {
    let entry = ExecutionLog.parse(new NodeReference(this), context);
    if (entry == null) return this;

    this.entriesValue.push(entry);

    return entry;
  }

  public override getChildren(): Array<INode> {
    return [...this.entriesValue];
  }

  protected override validate(context: IValidationContext): void {
  }

  public override getSymbol(): Symbol | null {
    return null;
  }
}
