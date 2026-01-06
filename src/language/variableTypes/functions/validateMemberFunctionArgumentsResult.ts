import {IMemberFunctionCall} from "./memberFunctionCall";

type ValidateMemberFunctionArgumentsFailed = {
  state: "failed";
}

export function newValidateMemberFunctionArgumentsFailed(): ValidateMemberFunctionArgumentsFailed {
  return {
    state: "failed",
  } as const;
}

type ValidateMemberFunctionArgumentsSuccess = {
  state: "success";
  functionCall: IMemberFunctionCall;
}

export function newValidateMemberFunctionArgumentsSuccess(functionCall: IMemberFunctionCall): ValidateMemberFunctionArgumentsSuccess {
  return {
    state: "success",
    functionCall: functionCall
  } as const;
}

export type ValidateMemberFunctionArgumentsResult = ValidateMemberFunctionArgumentsFailed | ValidateMemberFunctionArgumentsSuccess;
