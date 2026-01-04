import type {IValidationContext} from "../../parser/validationContext";

import {SourceReference} from "../../parser/sourceReference";
import {INode, Node} from "../node";
import {isNullOrEmpty} from "../../infrastructure/validationFunctions";
import {isValidIdentifier} from "../../parser/tokens/character";
import {NodeType} from "../nodeType";
import {Assert} from "../../infrastructure/assert";

export class EnumName extends Node {

  private readonly valueValue: string | null = null;

  public nodeType = NodeType.EnumName;

  public get value() {
    return Assert.notNull(this.valueValue, "value");
  }

  constructor(name: string, sourceReference: SourceReference) {
    super(sourceReference);
    this.valueValue = name;
  }

  public override getChildren(): Array<INode> {
    return [];
  }

  protected override validate(context: IValidationContext): void {
    if (isNullOrEmpty(this.value)) {
      context.logger.fail(this.reference, `Invalid enum name: ${this.value}. name should not be empty.`);
    } else if (!isValidIdentifier(this.value)) {
      context.logger.fail(this.reference, `Invalid enum name: ${this.value}.`);
    }
  }

  public static parseName(parameter: string, reference: SourceReference): EnumName {
    return new EnumName(parameter, reference);
  }
}
