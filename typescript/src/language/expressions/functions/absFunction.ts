import {SingleArgumentFunction} from "./singleArgumentFunction";
import {PrimitiveType} from "../../variableTypes/primitiveType";
import {SourceReference} from "../../../parser/sourceReference";
import {Expression} from "../expression";
import {ExpressionFunction} from "./expressionFunction";
import {NodeType} from "../../nodeType";

export class AbsFunction extends SingleArgumentFunction {

   public readonly nodeType = NodeType.AbsFunction;
   public static readonly functionName: string = `ABS`;

   protected override get functionHelp(): string {
      return `${AbsFunction.functionName} expects 1 argument (Value)`;
   }

   constructor(valueExpression: Expression, reference: SourceReference) {
     super(valueExpression, reference, PrimitiveType.number, PrimitiveType.number);
   }

   public static create(reference: SourceReference, expression: Expression): ExpressionFunction {
     return new AbsFunction(expression, reference);
   }
}
