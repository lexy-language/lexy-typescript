import type {IParseLineContext} from "../../parser/ParseLineContext";
import type {IValidationContext} from "../../parser/validationContext";

import {SourceReference} from "../../parser/sourceReference";
import {asQuotedLiteralToken, QuotedLiteralToken} from "../../parser/tokens/quotedLiteralToken";
import {INode, Node} from "../node";
import {NodeType} from "../nodeType";
import {Assert} from "../../infrastructure/assert";

export class ScenarioExpectError extends Node {
  private readonly messageValue: string | null = null;

  public readonly nodeType = NodeType.ScenarioExpectError;

  public get message(): string {
    return Assert.notNull(this.messageValue, "message");
  }

  public get hasValue(): boolean {
    return this.messageValue != null;
  }

  constructor(message: string, reference: SourceReference) {
    super(reference);
    this.messageValue = message;
  }

  public static parse(context: IParseLineContext, reference: SourceReference): ScenarioExpectError | null {
    let line = context.line;

    let valid = context.validateTokens("ScenarioExpectError")
      .count(2)
      .keyword(0)
      .quotedString(1)
      .isValid;

    if (!valid) return null;

    const token = line.tokens.token<QuotedLiteralToken>(1, asQuotedLiteralToken);
    if (token == null) throw new Error("No token.")

    return new ScenarioExpectError(token.value, reference);
  }

  public override getChildren(): Array<INode> {
    return [];
  }

  protected override validate(context: IValidationContext): void {
  }
}
