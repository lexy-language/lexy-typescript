import {IdentifierPath} from "../identifierPath";

export type IdentifierPathParseFailed = {
  state: "failed";
  errorMessage: string;
}

export function newIdentifierPathParseFailed(errorMessage: string, ): IdentifierPathParseFailed {
  return {
    state: "failed",
    errorMessage: errorMessage,
  } as const;
}

export type IdentifierPathParseSuccess = {
  state: "success";
  result: IdentifierPath;
}

export function newIdentifierPathParseSuccess(result: IdentifierPath): IdentifierPathParseSuccess {
  return {
    state: "success",
    result: result
  } as const;
}

export type VariablePathParseResult = IdentifierPathParseFailed | IdentifierPathParseSuccess;