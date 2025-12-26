import {EndStartDateFunction} from "./endStartDateFunction";
import {Expression} from "../expression";
import {NodeType} from "../../nodeType";
import {ExpressionSource} from "../expressionSource";
import {FunctionCallExpression} from "./functionCallExpression";

export class DaysFunction extends EndStartDateFunction {

   public static readonly functionName: string = `days`;

   public readonly nodeType = NodeType.DaysFunction;

   constructor(endDateExpression: Expression, startDateExpression: Expression, source: ExpressionSource) {
      super(DaysFunction.functionName, endDateExpression, startDateExpression, source);
   }

   public static create(source: ExpressionSource , endDateExpression: Expression,
     startDateExpression: Expression): FunctionCallExpression {
     return new DaysFunction(endDateExpression, startDateExpression, source);
   }
}
