import {ExpressionFunction} from "./expressionFunction";
import {VariableType} from "../../variableTypes/variableType";
import {SourceReference} from "../../../parser/sourceReference";
import {INode} from "../../node";
import {IValidationContext} from "../../../parser/validationContext";

export abstract class NoArgumentFunction extends ExpressionFunction {

  protected readonly resultType: VariableType;

  protected constructor(reference: SourceReference, resultType: VariableType){
   super(reference);
   this.resultType = resultType;
 }

   public override getChildren(): Array<INode> {
     return [];
   }

   protected override validate(context: IValidationContext): void {
   }

   public override deriveReturnType(context: IValidationContext): VariableType {
     return this.resultType;
   }
}
