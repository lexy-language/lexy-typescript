import {IValidationContext} from "../../../parser/validationContext";
import {VariableType} from "../../variableTypes/variableType";
import {SourceReference} from "../../../parser/sourceReference";
import {Node} from "../../node";
import {VariableUsage} from "../variableUsage";

export abstract class ExpressionFunction extends Node {
  protected constructor(reference: SourceReference) {
    super(reference);
  }

  public equals(other: ExpressionFunction): boolean {
    return other != null && this.nodeType == other.nodeType;
  }

  public abstract deriveReturnType(context: IValidationContext): VariableType | null;

  public usedVariables(): ReadonlyArray<VariableUsage> {
    return [];
  }
}
