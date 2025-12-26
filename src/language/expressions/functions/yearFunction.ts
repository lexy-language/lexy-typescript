import {SingleArgumentFunction} from "./singleArgumentFunction";
import {Expression} from "../expression";
import {PrimitiveType} from "../../variableTypes/primitiveType";
import {NodeType} from "../../nodeType";
import {ExpressionSource} from "../expressionSource";
import {FunctionCallExpression} from "./functionCallExpression";

export class YearFunction extends SingleArgumentFunction {

   public static readonly functionName: string = `year`;
   public readonly nodeType = NodeType.YearFunction;

   protected override get functionHelp(): string {
      return `'{Name} expects 1 argument (Date)`;
   }

   constructor(valueExpression: Expression, source: ExpressionSource) {
      super(YearFunction.functionName, valueExpression, source, PrimitiveType.date, PrimitiveType.number);
   }

   public static create(source: ExpressionSource, expression: Expression): FunctionCallExpression {
     return new YearFunction(expression, source);
   }
}
