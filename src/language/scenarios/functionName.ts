import type {IParseLineContext} from "../../parser/ParseLineContext";
import type {IValidationContext} from "../../parser/validationContext";
import {INode, Node} from "../node";
import {SourceReference} from "../../parser/sourceReference";
import {isNullOrEmpty, isValidIdentifier} from "../../parser/tokens/character";
import {NodeType} from "../nodeType";
import {Assert} from "../../infrastructure/assert";

export class functionName extends Node {

  private valueValue: string | null = null;

  public readonly nodeType = NodeType.ScenarioFunctionName;

  public get hasValue() {
    return this.valueValue != null;
  }

  public get value() {
    return Assert.notNull(this.valueValue, "value");
  }

  constructor(name: string, reference: SourceReference) {
    super(reference);
    this.valueValue = name;
  }

  public static parse(context: IParseLineContext, reference: SourceReference): functionName | null {
    const name = context.line.tokens.tokenValue(1);
    if (!name) {
      context.logger.fail(reference, "No function functionName found. Use 'Function:' for inline functions.")
      return null;
    }
    return new functionName(name, reference);
  }

  public override getChildren(): Array<INode> {
    return [];
  }

  protected override validate(context: IValidationContext): void {
    if (!isNullOrEmpty(this.valueValue) && !isValidIdentifier(this.valueValue)) {
      context.logger.fail(this.reference, `Invalid scenario function name: '${this.valueValue}'.`);
    }
  }

  public isEmpty(): boolean {
    return isNullOrEmpty(this.valueValue);
  }

  public toString() {
    return this.valueValue;
  }
}
