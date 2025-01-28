import {SingleArgumentFunction} from "./singleArgumentFunction";
import {PrimitiveType} from "../../variableTypes/primitiveType";
import {Expression} from "../expression";
import {NodeType} from "../../nodeType";
import {ExpressionSource} from "../expressionSource";
import {FunctionCallExpression} from "./functionCallExpression";

export class MinuteFunction extends SingleArgumentFunction {
   public static readonly functionName: string = `MINUTE`;

   public readonly nodeType = NodeType.MinuteFunction;

   protected override get functionHelp(): string {
      return `'${MinuteFunction.functionName} expects 1 argument (Date)`
   }

   constructor(valueExpression: Expression, soure: ExpressionSource) {
     super(MinuteFunction.functionName, valueExpression, soure, PrimitiveType.date, PrimitiveType.number);
   }

   public static create(soure: ExpressionSource, expression: Expression): FunctionCallExpression {
     return new MinuteFunction(expression, soure);
   }
}
