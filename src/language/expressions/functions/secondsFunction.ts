import {EndStartDateFunction} from "./endStartDateFunction";
import {Expression} from "../expression";
import {NodeType} from "../../nodeType";
import {ExpressionSource} from "../expressionSource";
import {FunctionCallExpression} from "./functionCallExpression";

export class SecondsFunction extends EndStartDateFunction {

  public static readonly functionName: string = `seconds`;
  public readonly nodeType = NodeType.SecondsFunction;

  constructor(endDateExpression: Expression, startDateExpression: Expression, source: ExpressionSource) {
    super(SecondsFunction.functionName, endDateExpression, startDateExpression, source);
  }

  public static create(source: ExpressionSource, endDateExpression: Expression,
                       startDateExpression: Expression): FunctionCallExpression {
    return new SecondsFunction(endDateExpression, startDateExpression, source);
  }
}
