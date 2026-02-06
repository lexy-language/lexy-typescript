import type {IParseLineContext} from "../../parser/context/parseLineContext";
import type {IValidationContext} from "../../parser/context/validationContext";
import {INode, Node} from "../node";
import {SourceReference} from "../sourceReference";
import {isNullOrEmpty} from "../../infrastructure/validationFunctions";
import {isValidIdentifier} from "../../parser/tokens/character";
import {NodeType} from "../nodeType";
import {Assert} from "../../infrastructure/assert";
import {Scenario} from "./scenario";
import {Symbol} from "../symbols/symbol";

export class functionName extends Node {

  private valueValue: string | null = null;

  public readonly nodeType = NodeType.ScenarioFunctionName;

  public get hasValue() {
    return this.valueValue != null;
  }

  public get value() {
    return Assert.notNull(this.valueValue, "value");
  }

  constructor(name: string, parent: Scenario, reference: SourceReference) {
    super(parent, reference);
    this.valueValue = name;
  }

  public static parse(context: IParseLineContext, parent: Scenario, reference: SourceReference): functionName | null {
    const name = context.line.tokens.tokenValue(1);
    if (!name) {
      context.logger.fail(reference, "No function functionName found.")
      return null;
    }
    return new functionName(name, parent, reference);
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

  public override getSymbol(): Symbol | null {
    return null;
  }
}
