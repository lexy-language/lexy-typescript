import {VariableNameExpression} from "./variableNameExpression";

export type ParseVariableNameExpressionFailed = {
  state: "failed";
  errorMessage: string;
}

export function newParseVariableNameExpressionFailed(typeName: string, errorMessage: string, ): ParseVariableNameExpressionFailed {
  return {
    state: "failed",
    errorMessage: `(${typeName}) ${errorMessage}`,
  } as const;
}

export type ParseVariableNameExpressionSuccess = {
  state: "success";
  result: VariableNameExpression;
}

export function newParseVariableNameExpressionSuccess(result: VariableNameExpression) {
  return {
    state: "success",
    result: result
  } as const;
}

export type ParseVariableNameExpressionResult = ParseVariableNameExpressionFailed | ParseVariableNameExpressionSuccess;
