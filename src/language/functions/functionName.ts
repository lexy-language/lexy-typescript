import type {IValidationContext} from "../../parser/validationContext";

import {INode, Node} from "../node";
import {SourceReference} from "../../parser/sourceReference";
import {isNullOrEmpty} from "../../infrastructure/validationFunctions";
import {isValidIdentifier} from "../../parser/tokens/character";
import {NodeType} from "../nodeType";
import {Assert} from "../../infrastructure/assert";

export class FunctionName extends Node {

  private valueValue: string | null = null;

  public readonly nodeType = NodeType.FunctionName;

  public get value(): string {
    return Assert.notNull(this.valueValue, "value");
  }

  constructor(name: string, reference: SourceReference) {
    super(reference);
    this.valueValue = name;
  }

  public override getChildren(): Array<INode> {
    return [];
  }

  protected override validate(context: IValidationContext): void {
    if (isNullOrEmpty(this.value)) {
      context.logger.fail(this.reference, `Invalid function name: '${this.value}'. Name should not be empty.`);
    }
    if (!isValidIdentifier(this.value)) context.logger.fail(this.reference, `Invalid function name: '${this.value}'.`);
  }

  public static parseName(name: string, reference: SourceReference): FunctionName {
    return new FunctionName(name, reference);
  }

  public toString() {
    return this.valueValue;
  }
}
