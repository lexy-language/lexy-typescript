import {IFunctionCallState} from "./functionCallState";

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
  functionCallState: IFunctionCallState;
}

export function newValidateMemberFunctionArgumentsSuccess(functionCall: IFunctionCallState): ValidateMemberFunctionArgumentsSuccess {
  return {
    state: "success",
    functionCallState: functionCall
  } as const;
}

export type ValidateMemberFunctionArgumentsResult = ValidateMemberFunctionArgumentsFailed | ValidateMemberFunctionArgumentsSuccess;
