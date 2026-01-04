import {FunctionCallExpression} from "./functionCallExpression";

export type ParseExpressionFunctionsFailed = {
  state: "failed";
  errorMessage: string;
}

export function newParseExpressionFunctionsFailed(errorMessage: string): ParseExpressionFunctionsFailed {
  return {
    state: "failed",
    errorMessage: errorMessage,
  } as const;
}

export type ParseExpressionFunctionsSuccess = {
  state: "success";
  result: FunctionCallExpression;
}

export function newParseExpressionFunctionsSuccess(result: FunctionCallExpression): ParseExpressionFunctionsSuccess {
  return {
    state: "success",
    result: result
  } as const;
}

export type ParseExpressionFunctionsResult = ParseExpressionFunctionsFailed | ParseExpressionFunctionsSuccess;