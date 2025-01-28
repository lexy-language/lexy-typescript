import {SingleArgumentFunction} from "./singleArgumentFunction";
import {Expression} from "../expression";
import {PrimitiveType} from "../../variableTypes/primitiveType";
import {NodeType} from "../../nodeType";
import {ExpressionSource} from "../expressionSource";
import {FunctionCallExpression} from "./functionCallExpression";

export class SecondFunction extends SingleArgumentFunction {
   public static readonly functionName: string = `SECOND`;

   protected override get functionHelp(): string {
      return `'${SecondFunction.functionName} expects 1 argument (Date)`;
   }

   public readonly nodeType = NodeType.SecondFunction;

   constructor(valueExpression: Expression, source: ExpressionSource) {
      super(SecondFunction.functionName, valueExpression, source, PrimitiveType.date, PrimitiveType.number);
   }

   public static create(source: ExpressionSource, expression: Expression): FunctionCallExpression {
     return new SecondFunction(expression, source);
   }
}
