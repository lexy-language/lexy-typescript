import {NoArgumentFunction} from "./noArgumentFunction";
import {PrimitiveType} from "../../variableTypes/primitiveType";
import {NodeType} from "../../nodeType";
import {ExpressionSource} from "../expressionSource";
import {FunctionCallExpression} from "./functionCallExpression";

export class TodayFunction extends NoArgumentFunction {
   public static readonly functionName: string = `today`;

  public readonly nodeType = NodeType.TodayFunction;

   constructor(source: ExpressionSource) {
     super(TodayFunction.functionName, source, PrimitiveType.date);
   }

   public static create(source: ExpressionSource): FunctionCallExpression {
     return new TodayFunction(source);
   }
}
