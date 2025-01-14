import {INode, Node} from "../node";
import {SourceReference} from "../../parser/sourceReference";
import {IValidationContext} from "../../parser/validationContext";
import {isNullOrEmpty, isValidIdentifier} from "../../parser/tokens/character";
import {NodeType} from "../nodeType";
import {Assert} from "../../infrastructure/assert";

export class FunctionName extends Node {

  private valueValue: string | null = null;

  public readonly nodeType = NodeType.FunctionName;

  public get value(): string {
    return Assert.notNull(this.valueValue, "value");
  }

  constructor(reference: SourceReference) {
    super(reference);
  }

  public parseName(name: string): void {
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
}
