import {SingleArgumentFunction} from "./singleArgumentFunction";
import {VariableType} from "../../variableTypes/variableType";
import {PrimitiveType} from "../../variableTypes/PrimitiveType";
import {Expression} from "../expression";
import {SourceReference} from "../../../parser/sourceReference";
import {ExpressionFunction} from "./expressionFunction";

export class IntFunction extends SingleArgumentFunction {
   
   public readonly name: string = `INT`;
   public readonly nodeType = "IntFunction";

   protected override get functionHelp(): string {
      return `{Name} expects 1 argument (Value)`;
   }

   constructor(valueExpression: Expression, reference: SourceReference) {
     super(valueExpression, reference, PrimitiveType.number, PrimitiveType.number);
   }

   public static create(reference: SourceReference, expression: Expression): ExpressionFunction {
     return new IntFunction(expression, reference);
   }
}
