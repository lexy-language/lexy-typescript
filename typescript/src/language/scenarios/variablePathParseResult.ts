import {VariablePath} from "../variablePath";

export type VariablePathParseFailed = {
  state: "failed";
  errorMessage: string;
}

export function newVariablePathParseFailed(errorMessage: string, ): VariablePathParseFailed {
  return {
    state: "failed",
    errorMessage: errorMessage,
  } as const;
}

export type VariablePathParseSuccess = {
  state: "success";
  result: VariablePath;
}

export function newVariablePathParseSuccess(result: VariablePath): VariablePathParseSuccess {
  return {
    state: "success",
    result: result
  } as const;
}

export type VariablePathParseResult = VariablePathParseFailed | VariablePathParseSuccess;