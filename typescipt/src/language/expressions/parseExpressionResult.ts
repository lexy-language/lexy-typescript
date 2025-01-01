type ParseExpressionFailed = {
  state: "failed";
  errorMessage: string;
  reference: SourceReference;
}

export function newParseExpressionFailed(reference: SourceReference, errorMessage: string): ParseExpressionFailed {
  return {
    state: "failed",
    errorMessage: errorMessage,
    reference: reference
  } as const;
}

type ParseExpressionSuccess = {
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