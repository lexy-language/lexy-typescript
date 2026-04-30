export function compileExpression<TValue, TReturn>(expression: (value: TValue) => TReturn, model: TValue):
  [value: TReturn, message: string] {
  let value = expression(model);
  let message = getExpressionPropertiesPath(expression);
  return [value, message];
}

function getExpressionPropertiesPath<TValue, TReturn>(expression: (value: TValue) => TReturn): string {
  let functionString = expression.toString();
  return functionString.slice(functionString.indexOf(">") + 2);
}
