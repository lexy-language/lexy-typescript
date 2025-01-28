import type {INode} from "../../node";
import type {IValidationContext} from "../../../parser/validationContext";

import {Expression} from '../expression';
import {PrimitiveType} from "../../variableTypes/primitiveType";
import {VariableType} from "../../variableTypes/variableType";
import {NodeType} from "../../nodeType";
import {FunctionCallExpression} from "./functionCallExpression";
import {ExpressionSource} from "../expressionSource";

export function instanceOfPowerFunction(object: any): object is PowerFunction {
  return object?.nodeType == NodeType.PowerFunction;
}

export function asPowerFunction(object: any): PowerFunction | null {
  return instanceOfPowerFunction(object) ? object as PowerFunction : null;
}

export class PowerFunction extends FunctionCallExpression {

  public static readonly functionName: string = `POWER`;

  private get functionHelp() {
    return `${PowerFunction.functionName} expects 2 arguments (Number, Power).`;
  }

  public readonly nodeType = NodeType.PowerFunction;
  public numberExpression: Expression;
  public powerExpression: Expression;

  constructor(numberExpression: Expression, powerExpression: Expression, source: ExpressionSource) {
    super(PowerFunction.functionName, source);
    this.numberExpression = numberExpression;
    this.powerExpression = powerExpression;
  }

  public override getChildren(): Array<INode> {
    return [
      this.numberExpression,
      this.powerExpression
    ]
  }

  protected override validate(context: IValidationContext): void {
    context
      .validateType(this.numberExpression, 1, `Number`, PrimitiveType.number, this.reference, this.functionHelp)
      .validateType(this.powerExpression, 2, `Power`, PrimitiveType.number, this.reference, this.functionHelp);
  }

  public override deriveType(context: IValidationContext): VariableType {
    return PrimitiveType.number;
  }

  public static create(source: ExpressionSource, numberExpression: Expression,
                       powerExpression: Expression): FunctionCallExpression {
    return new PowerFunction(numberExpression, powerExpression, source);
  }
}
