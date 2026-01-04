import {VariableType} from "../variableTypes/variableType";
import {IInstanceFunctionCall} from "./IInstanceFunctionCall";

type ValidateInstanceFunctionArgumentsFailed = {
  state: "failed";
}

export function newValidateInstanceFunctionArgumentsFailed(): ValidateInstanceFunctionArgumentsFailed {
  return {
    state: "failed"
  } as const;
}

type ValidateInstanceFunctionArgumentsSuccess = {
  state: "success";
  functionCall: IInstanceFunctionCall;
}

export function newValidateInstanceFunctionArgumentsSuccess(functionCall: IInstanceFunctionCall): ValidateInstanceFunctionArgumentsSuccess {
  return {
    state: "success",
    functionCall: functionCall
  } as const;
}

export type ValidateInstanceFunctionArgumentsResult = ValidateInstanceFunctionArgumentsFailed | ValidateInstanceFunctionArgumentsSuccess;
