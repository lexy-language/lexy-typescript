export function compileExpression<TValue, TReturn>(expression: (value: TValue) => TReturn, model: TValue):
  [value: TReturn, message: string] {
  let value = expression(model);
  let message = getExpressionPropertiesPath(expression);
  return [value, message];
}

type ValueOf<T> = T[keyof T];
function getExpressionPropertiesPath<T, V extends T[keyof T]>(expression: (x: T)=>V): ValueOf<{[K in keyof T]: T[K] extends V ? K : never}>;
function getExpressionPropertiesPath(expression: (x: any)=>any): keyof any {
  let functionString = expression.toString();
  return functionString.slice(functionString.lastIndexOf(" ") + 1);
}
