import {Expression} from "../expression";
import {ExpressionFunction} from "./expressionFunction";
import {VariableType} from "../../variableTypes/variableType";
import {SourceReference} from "../../../parser/sourceReference";
import {INode} from "../../node";
import {IValidationContext} from "../../../parser/validationContext";

export abstract class SingleArgumentFunction extends ExpressionFunction {
   protected abstract functionHelp: string;

  protected readonly argumentType: VariableType;
  protected readonly resultType: VariableType;

  public readonly valueExpression: Expression;

   constructor(valueExpression: Expression, reference: SourceReference,
               argumentType: VariableType, resultType: VariableType) {
     super(reference);
     this.valueExpression = valueExpression;
     this.argumentType = argumentType;
     this.resultType = resultType;
   }

   public override getChildren(): Array<INode> {
     return [this.valueExpression];
   }

   protected override validate(context: IValidationContext): void {
     context.validateType(this.valueExpression, 1, `Value`, this.argumentType, this.reference, this.functionHelp);
   }

   public override deriveReturnType(context: IValidationContext): VariableType {
     return this.resultType;
   }
}
