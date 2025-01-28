import {EndStartDateFunction} from "./endStartDateFunction";
import {Expression} from "../expression";
import {NodeType} from "../../nodeType";
import {FunctionCallExpression} from "./functionCallExpression";
import {ExpressionSource} from "../expressionSource";

export class HoursFunction extends EndStartDateFunction {

  public static readonly functionName: string = `HOURS`;
  public readonly nodeType = NodeType.HoursFunction;

  constructor(endDateExpression: Expression, startDateExpression: Expression, source: ExpressionSource) {
    super(HoursFunction.functionName, endDateExpression, startDateExpression, source);
  }

  public static create(source: ExpressionSource, endDateExpression: Expression,
                       startDateExpression: Expression): FunctionCallExpression {
    return new HoursFunction(endDateExpression, startDateExpression, source);
  }
}
