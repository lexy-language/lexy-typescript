import {Expression} from "../../../language/expressions/expression";
import {CodeWriter} from "../writers/codeWriter";

export interface ILineExpressionException {
  matches(expression: Expression): boolean;
  render(expression: Expression, codeWriter: CodeWriter): void;
}