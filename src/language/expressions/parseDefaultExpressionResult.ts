import {Expression} from "./expression";

export type ParseDefaultExpressionFailed = {
  state: "failed";
  errorMessage: string;
}

export function newParseDefaultExpressionFailed(typeName: string, errorMessage: string, ): ParseDefaultExpressionFailed {
  return {
    state: "failed",
    errorMessage: `(${typeName}) ${errorMessage}`,
  } as const;
}

export type ParseDefaultExpressionSuccess = {
  state: "success";
  result: Expression | null;
}

export function newParseDefaultExpressionSuccess(result: Expression | null) {
  return {
    state: "success",
    result: result
  } as const;
}

export type ParseDefaultExpressionResult = ParseDefaultExpressionFailed | ParseDefaultExpressionSuccess;
