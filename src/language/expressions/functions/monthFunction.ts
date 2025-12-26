import {SingleArgumentFunction} from "./singleArgumentFunction";
import {Expression} from "../expression";
import {SourceReference} from "../../../parser/sourceReference";
import {PrimitiveType} from "../../variableTypes/primitiveType";
import {NodeType} from "../../nodeType";
import {ExpressionSource} from "../expressionSource";
import {FunctionCallExpression} from "./functionCallExpression";

export class MonthFunction extends SingleArgumentFunction {

   public static readonly functionName: string = `month`;

   public readonly nodeType = NodeType.MonthFunction;

   protected override get functionHelp(): string {
      return `'${MonthFunction.functionName} expects 1 argument (Date)`;
   }

   constructor(valueExpression: Expression, source: ExpressionSource) {
      super(MonthFunction.functionName, valueExpression, source, PrimitiveType.date, PrimitiveType.number);
   }

   public static create(source: ExpressionSource, expression: Expression): FunctionCallExpression {
     return new MonthFunction(expression, source);
   }
}
