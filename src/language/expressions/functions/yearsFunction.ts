import {EndStartDateFunction} from "./endStartDateFunction";
import {Expression} from "../expression";
import {NodeType} from "../../nodeType";
import {ExpressionSource} from "../expressionSource";
import {FunctionCallExpression} from "./functionCallExpression";

export class YearsFunction extends EndStartDateFunction {

  public static readonly functionName: string = `YEARS`;

  public readonly nodeType = NodeType.YearsFunction;

  constructor(endDateExpression: Expression, startDateExpression: Expression, source: ExpressionSource) {
    super(YearsFunction.functionName, endDateExpression, startDateExpression, source);
  }

  public static create(source: ExpressionSource, endDateExpression: Expression,
                       startDateExpression: Expression): FunctionCallExpression {
    return new YearsFunction(endDateExpression, startDateExpression, source);
  }
}
