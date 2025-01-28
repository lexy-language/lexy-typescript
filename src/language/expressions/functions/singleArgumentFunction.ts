import type {INode} from "../../node";
import type {IValidationContext} from "../../../parser/validationContext";

import {Expression} from "../expression";
import {VariableType} from "../../variableTypes/variableType";
import {FunctionCallExpression} from "./functionCallExpression";
import {ExpressionSource} from "../expressionSource";

export abstract class SingleArgumentFunction extends FunctionCallExpression {
   protected abstract functionHelp: string;

  protected readonly argumentType: VariableType;
  protected readonly resultType: VariableType;

  public readonly valueExpression: Expression;

   protected constructor(functionName: string, valueExpression: Expression, source: ExpressionSource,
               argumentType: VariableType, resultType: VariableType) {
     super(functionName, source);
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

   public override deriveType(context: IValidationContext): VariableType {
     return this.resultType;
   }
}
