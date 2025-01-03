import {Expression} from "./expression";

export type ParseExpressionFailed = {
  state: "failed";
  errorMessage: string;
}

export function newParseExpressionFailed(constr: Function, errorMessage: string, ): ParseExpressionFailed {
  return {
    state: "failed",
    errorMessage: `(${constr.name}) ${errorMessage}`,
  } as const;
}

export type ParseExpressionSuccess = {
  state: "success";
  result: Expression;
}

export function newParseExpressionSuccess(result: Expression) {
  return {
    state: "success",
    result: result
  } as const;
}

export type ParseExpressionResult = ParseExpressionFailed | ParseExpressionSuccess;