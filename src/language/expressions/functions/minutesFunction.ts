import {EndStartDateFunction} from "./endStartDateFunction";
import {Expression} from "../expression";
import {NodeType} from "../../nodeType";
import {FunctionCallExpression} from "./functionCallExpression";
import {ExpressionSource} from "../expressionSource";

export class MinutesFunction extends EndStartDateFunction {
  public static readonly functionName: string = `MINUTES`;

  public readonly nodeType = NodeType.MinutesFunction;


  constructor(endDateExpression: Expression, startDateExpression: Expression, source: ExpressionSource) {
    super(MinutesFunction.functionName, endDateExpression, startDateExpression, source);
  }

  public static create(source: ExpressionSource, endDateExpression: Expression,
                       startDateExpression: Expression): FunctionCallExpression {
    return new MinutesFunction(endDateExpression, startDateExpression, source);
  }
}
