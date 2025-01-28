import {SingleArgumentFunction} from "./singleArgumentFunction";
import {PrimitiveType} from "../../variableTypes/primitiveType";
import {Expression} from "../expression";
import {NodeType} from "../../nodeType";
import {FunctionCallExpression} from "./functionCallExpression";
import {ExpressionSource} from "../expressionSource";

export function instanceOfAbsFunction(object: any): object is AbsFunction {
   return object?.nodeType == NodeType.AbsFunction;
}

export function asAbsFunction(object: any): AbsFunction | null {
   return instanceOfAbsFunction(object) ? object as AbsFunction : null;
}

export class AbsFunction extends SingleArgumentFunction {

   public readonly nodeType = NodeType.AbsFunction;
   public static readonly functionName: string = `ABS`;

   protected override get functionHelp(): string {
      return `${AbsFunction.functionName} expects 1 argument (Value)`;
   }

   constructor(valueExpression: Expression, source: ExpressionSource) {
     super(AbsFunction.functionName, valueExpression, source, PrimitiveType.number, PrimitiveType.number);
   }

   public static create(source: ExpressionSource, expression: Expression): FunctionCallExpression {
     return new AbsFunction(expression, source);
   }
}
