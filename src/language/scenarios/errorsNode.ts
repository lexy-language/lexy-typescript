import type{INode} from "../node";
import type {IParsableNode} from "../parsableNode";
import type {IParseLineContext} from "../../parser/context/parseLineContext";
import type {IValidationContext} from "../../parser/context/validationContext";

import {ParsableNode} from "../parsableNode";
import {SourceReference} from "../sourceReference";
import {asQuotedLiteralToken, QuotedLiteralToken} from "../../parser/tokens/quotedLiteralToken";
import {NodeReference} from "../nodeReference";
import {Symbol} from "../symbols/symbol";

export abstract class ErrorsNode extends ParsableNode {

  private readonly messagesValue: Array<string> = [];

  public get messages(): ReadonlyArray<string> {
    return this.messagesValue
  }

  public get hasValues(): boolean {
    return this.messages.length > 0;
  }

  protected constructor(parentReference: NodeReference, reference: SourceReference) {
    super(parentReference, reference);
  }

  public override parse(context: IParseLineContext): IParsableNode {
    let line = context.line;
    let valid = context.validateTokens(this.nodeType)
      .count(1)
      .quotedString(0)
      .isValid;

    if (!valid) return this;

    const token = line.tokens.token<QuotedLiteralToken>(0, asQuotedLiteralToken);
    if (token == null) throw new Error("No token found.");

    this.messagesValue.push(token.value);
    return this;
  }

  public override getChildren(): Array<INode> {
    return [];
  }

  protected override validate(context: IValidationContext): void {
  }

  public override getSymbol(): Symbol | null {
    return null;
  }
}
