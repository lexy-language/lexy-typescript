import type {INode} from "../../node";
import type {IValidationContext} from "../../../parser/validationContext";

import {VariableType} from "../../variableTypes/variableType";
import {FunctionCallExpression} from "./functionCallExpression";
import {ExpressionSource} from "../expressionSource";

export abstract class NoArgumentFunction extends FunctionCallExpression {

  protected readonly resultType: VariableType;

  protected constructor(functionName: string, source: ExpressionSource, resultType: VariableType){
   super(functionName, source);
   this.resultType = resultType;
 }

   public override getChildren(): Array<INode> {
     return [];
   }

   protected override validate(context: IValidationContext): void {
   }

   public override deriveType(context: IValidationContext): VariableType {
     return this.resultType;
   }
}
