import {INode, Node} from "../node";
import {SourceReference} from "../../parser/sourceReference";
import {IValidationContext} from "../../parser/validationContext";
import {isNullOrEmpty, isValidIdentifier} from "../../parser/tokens/character";
import {NodeType} from "../nodeType";
import {Assert} from "../../infrastructure/assert";

export class ScenarioName extends Node {

  private valueValue: string | null = null;

  public readonly nodeType = NodeType.ScenarioName;

  public get value() {
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
      context.logger.fail(this.reference, `Invalid scenario name: '${this.value}'. Name should not be empty.`);
    }
    if (!isValidIdentifier(this.value)) context.logger.fail(this.reference, `Invalid scenario name: '${this.value}'.`);
  }

  public toString() {
    return this.value;
  }

  public static parseName(name: string, reference: SourceReference): ScenarioName {
    return new ScenarioName(name, reference);
  }
}
