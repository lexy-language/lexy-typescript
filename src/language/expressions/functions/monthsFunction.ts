import {EndStartDateFunction} from "./endStartDateFunction";
import {Expression} from "../expression";
import {NodeType} from "../../nodeType";
import {FunctionCallExpression} from "./functionCallExpression";
import {ExpressionSource} from "../expressionSource";

export class MonthsFunction extends EndStartDateFunction {

  public static readonly functionName: string = `months`;
  public readonly nodeType = NodeType.MonthsFunction;

  constructor(endDateExpression: Expression, startDateExpression: Expression, source: ExpressionSource) {
    super(MonthsFunction.functionName, endDateExpression, startDateExpression, source);
  }

  public static create(source: ExpressionSource, endDateExpression: Expression,
                       startDateExpression: Expression): FunctionCallExpression {
    return new MonthsFunction(endDateExpression, startDateExpression, source);
  }
}
