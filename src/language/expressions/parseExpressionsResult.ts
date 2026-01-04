import {Expression} from "./expression";

export type ParseExpressionsFailed = {
  state: "failed";
  errorMessage: string;
}

export function newParseExpressionsFailed(typeName: string, errorMessage: string, ): ParseExpressionsFailed {
  return {
    state: "failed",
    errorMessage: `(${typeName}) ${errorMessage}`,
  } as const;
}

export type ParseExpressionsSuccess = {
  state: "success";
  result: Array<Expression>;
}

export function newParseExpressionsSuccess(result: Array<Expression>) {
  return {
    state: "success",
    result: result
  } as const;
}

export type ParseExpressionsResult = ParseExpressionsFailed | ParseExpressionsSuccess;