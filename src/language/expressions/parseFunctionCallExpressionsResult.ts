import {FunctionCallExpression} from "./functions/functionCallExpression";

type ParseFunctionCallExpressionsFailed = {
  state: "failed";
  errorMessage: string;
}

export function newParseFunctionCallExpressionsFailed(errorMessage: string, ): ParseFunctionCallExpressionsFailed {
  return {
    state: "failed",
    errorMessage: errorMessage,
  } as const;
}

type ParseFunctionCallExpressionsSuccess = {
  state: "success";
  result: FunctionCallExpression;
}

export function newParseFunctionCallExpressionsSuccess(result: FunctionCallExpression) {
  return {
    state: "success",
    result: result
  } as const;
}

export type ParseFunctionCallExpressionsResult = ParseFunctionCallExpressionsFailed | ParseFunctionCallExpressionsSuccess;