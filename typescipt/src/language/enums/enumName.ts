import {SourceReference} from "../../parser/sourceReference";
import {INode, Node} from "../node";
import {IValidationContext} from "../../parser/validationContext";
import {isNullOrEmpty, isValidIdentifier} from "../../parser/tokens/character";
import {NodeType} from "../nodeType";
import {Assert} from "../../infrastructure/assert";

export class EnumName extends Node {

  private valueValue: string | null = null;

  public nodeType = NodeType.EnumName;

  public get value() {
    return Assert.notNull(this.valueValue, "value");
  }

  constructor(sourceReference: SourceReference) {
    super(sourceReference);
  }

  public parseName(parameter: string): void {
    this.valueValue = parameter;
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
}
