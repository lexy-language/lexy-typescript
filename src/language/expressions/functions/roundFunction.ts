import type {INode} from "../../node";
import type {IValidationContext} from "../../../parser/validationContext";

import {Expression} from "../expression";
import {PrimitiveType} from "../../variableTypes/primitiveType";
import {VariableType} from "../../variableTypes/variableType";
import {NodeType} from "../../nodeType";
import {FunctionCallExpression} from "./functionCallExpression";
import {ExpressionSource} from "../expressionSource";

export function instanceOfRoundFunction(object: any): object is RoundFunction {
  return object?.nodeType == NodeType.RoundFunction;
}

export function asRoundFunction(object: any): RoundFunction | null {
  return instanceOfRoundFunction(object) ? object as RoundFunction : null;
}

export class RoundFunction extends FunctionCallExpression {
   public static readonly functionName: string = `round`;

   private get functionHelp() {
     return `'${RoundFunction.name}' expects 2 arguments (Number, Digits).`;
   }

  public readonly nodeType = NodeType.RoundFunction;
  public numberExpression: Expression;
  public digitsExpression: Expression;

  constructor(numberExpression: Expression, digitsExpression: Expression, source: ExpressionSource) {
     super(RoundFunction.functionName, source);
     this.numberExpression = numberExpression;
     this.digitsExpression = digitsExpression;
   }

   public override getChildren(): Array<INode> {
    return [
      this.numberExpression,
      this.digitsExpression
    ];
   }

   protected override validate(context: IValidationContext): void {
     context
       .validateType(this.numberExpression, 1, `Number`, PrimitiveType.number, this.reference, this.functionHelp)
       .validateType(this.digitsExpression, 2, `Digits`, PrimitiveType.number, this.reference, this.functionHelp);
   }

   public override deriveType(context: IValidationContext): VariableType {
     return PrimitiveType.number;
   }

   public static create(source: ExpressionSource, numberExpression: Expression, powerExpression: Expression): FunctionCallExpression {
     return new RoundFunction(numberExpression, powerExpression, source);
   }
}
