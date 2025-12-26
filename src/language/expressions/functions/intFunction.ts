import {SingleArgumentFunction} from "./singleArgumentFunction";
import {PrimitiveType} from "../../variableTypes/primitiveType";
import {Expression} from "../expression";
import {NodeType} from "../../nodeType";
import {FunctionCallExpression} from "./functionCallExpression";
import {ExpressionSource} from "../expressionSource";

export function instanceOfIntFunction(object: any): object is IntFunction {
  return object?.nodeType == NodeType.IntFunction;
}

export function asIntFunction(object: any): IntFunction | null {
  return instanceOfIntFunction(object) ? object as IntFunction : null;
}

export class IntFunction extends SingleArgumentFunction {

  public static readonly functionName: string = `int`;
  public readonly nodeType = NodeType.IntFunction;

  protected override get functionHelp(): string {
    return `${IntFunction.functionName} expects 1 argument (Value)`;
  }

  constructor(valueExpression: Expression, source: ExpressionSource) {
    super(IntFunction.functionName, valueExpression, source, PrimitiveType.number, PrimitiveType.number);
  }

  public static create(source: ExpressionSource, expression: Expression): FunctionCallExpression {
    return new IntFunction(expression, source);
  }
}
