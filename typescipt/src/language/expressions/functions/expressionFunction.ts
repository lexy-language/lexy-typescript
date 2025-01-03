import {IValidationContext} from "../../../parser/validationContext";
import {VariableType} from "../../variableTypes/variableType";
import {SourceReference} from "../../../parser/sourceReference";
import {Node} from "../../node";

export abstract class ExpressionFunction extends Node {
   protected constructor(reference: SourceReference) {
     super(reference);
   }

   public abstract deriveReturnType(context: IValidationContext): VariableType | null;
}
