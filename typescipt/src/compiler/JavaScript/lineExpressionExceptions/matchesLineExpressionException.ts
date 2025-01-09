import {Expression} from "../../../language/expressions/expression";
import {NewFunctionExpressionStatementException} from "./newFunctionExpressionStatementException";
import {FillFunctionExpressionStatementException} from "./fillFunctionExpressionStatementException";
import {ExtractFunctionExpressionStatementException} from "./extractFunctionExpressionStatementException";
import {SimpleLexyFunctionFunctionExpressionStatementException} from "./simpleLexyFunctionFunctionExpressionStatementException";
import {ILineExpressionException} from "./ILineExpressionException";
import {firstOrDefault} from "../../../infrastructure/enumerableExtensions";

const renderStatementExceptions: Array<ILineExpressionException> = [
  new NewFunctionExpressionStatementException(),
  new FillFunctionExpressionStatementException(),
  new ExtractFunctionExpressionStatementException(),
  new SimpleLexyFunctionFunctionExpressionStatementException()
];

export function matchesLineExpressionException(expression: Expression) : ILineExpressionException | null {
  return firstOrDefault(renderStatementExceptions, exception => exception.matches(expression));
}