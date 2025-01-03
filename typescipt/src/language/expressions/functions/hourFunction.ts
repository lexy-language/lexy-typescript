import {SingleArgumentFunction} from "./singleArgumentFunction";
import {VariableType} from "../../variableTypes/variableType";
import {PrimitiveType} from "../../variableTypes/primitiveType";
import {Expression} from "../expression";
import {SourceReference} from "../../../parser/sourceReference";
import {ExpressionFunction} from "./expressionFunction";

export class HourFunction extends SingleArgumentFunction {

   public readonly nodeType = "HourFunction";
   public readonly name = `HOUR`;

   protected override get functionHelp() {
      return `'{Name} expects 1 argument (Date)`;
   }

   constructor(valueExpression: Expression, reference: SourceReference) {
     super(valueExpression, reference, PrimitiveType.date, PrimitiveType.number);
   }

   public static create(reference: SourceReference, expression: Expression): ExpressionFunction {
     return new HourFunction(expression, reference);
   }
}
