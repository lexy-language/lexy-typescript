import {SingleArgumentFunction} from "./singleArgumentFunction";
import {PrimitiveType} from "../../variableTypes/primitiveType";
import {Expression} from "../expression";
import {SourceReference} from "../../../parser/sourceReference";
import {NodeType} from "../../nodeType";
import {HoursFunction} from "./hoursFunction";
import {ExpressionSource} from "../expressionSource";
import {FunctionCallExpression} from "./functionCallExpression";

export class HourFunction extends SingleArgumentFunction {

   public readonly nodeType = NodeType.HourFunction;
   public static readonly functionName: string = `hour`;

   protected override get functionHelp() {
      return `${HourFunction.functionName} expects 1 argument (Date)`;
   }

   constructor(valueExpression: Expression, source: ExpressionSource) {
     super(HoursFunction.functionName, valueExpression, source, PrimitiveType.date, PrimitiveType.number);
   }

   public static create(source: ExpressionSource, expression: Expression): FunctionCallExpression {
     return new HourFunction(expression, source);
   }
}
