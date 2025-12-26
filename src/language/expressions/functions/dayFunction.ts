import {PrimitiveType} from "../../variableTypes/primitiveType";
import {SingleArgumentFunction} from "./singleArgumentFunction";
import {Expression} from "../expression";
import {NodeType} from "../../nodeType";
import {ExpressionSource} from "../expressionSource";
import {FunctionCallExpression} from "./functionCallExpression";

export class DayFunction extends SingleArgumentFunction {

  public readonly nodeType = NodeType.DayFunction;
  public static readonly functionName: string = `day`;

  protected override get functionHelp(): string {
    return `${DayFunction.functionName} expects 1 argument (Date)`;
  }

  constructor(valueExpression: Expression, source: ExpressionSource) {
    super(DayFunction.functionName, valueExpression, source, PrimitiveType.date, PrimitiveType.number);
  }

  public static create(source: ExpressionSource, expression: Expression): FunctionCallExpression {
    return new DayFunction(expression, source);
  }
}
