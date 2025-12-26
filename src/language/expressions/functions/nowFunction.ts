import {NoArgumentFunction} from "./noArgumentFunction";
import {PrimitiveType} from "../../variableTypes/primitiveType";
import {NodeType} from "../../nodeType";
import {ExpressionSource} from "../expressionSource";
import {FunctionCallExpression} from "./functionCallExpression";

export class NowFunction extends NoArgumentFunction {

  public static readonly functionName: string = `now`;

  public readonly nodeType = NodeType.NowFunction;

  constructor(source: ExpressionSource) {
    super(NowFunction.functionName, source, PrimitiveType.date);
  }

  public static create(source: ExpressionSource): FunctionCallExpression {
    return new NowFunction(source);
  }
}
