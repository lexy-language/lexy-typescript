import {VariableType} from "../variableTypes/variableType";

type ValidateFunctionArgumentsFailed = {
  state: "failed";
}

export function newValidateFunctionArgumentsFailed(): ValidateFunctionArgumentsFailed {
  return {
    state: "failed",
  } as const;
}

type ValidateFunctionArgumentsSuccess = {
  state: "success";
  parameterType: VariableType | null;
  resultType: VariableType;
  autoMap: boolean;
}

export function newValidateFunctionArgumentsSuccessAutoMap(parameterType: VariableType, resultType: VariableType): ValidateFunctionArgumentsSuccess {
  return {
    state: "success",
    autoMap: true,
    parameterType: parameterType,
    resultType: resultType
  } as const;
}

export function newValidateFunctionArgumentsSuccess(resultType: VariableType): ValidateFunctionArgumentsSuccess {
  return {
    state: "success",
    autoMap: false,
    parameterType: null,
    resultType: resultType
  } as const;
}

export type ValidateFunctionArgumentsResult = ValidateFunctionArgumentsFailed | ValidateFunctionArgumentsSuccess;
