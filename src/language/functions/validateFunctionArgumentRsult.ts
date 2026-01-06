import {VariableType} from "../variableTypes/variableType";
import {FunctionSignature} from "./functionSignature";

type ValidateFunctionArgumentsFailed = {
  state: "failed";
}

export function newValidateFunctionArgumentsFailed(): ValidateFunctionArgumentsFailed {
  return {
    state: "failed",
  } as const;
}

type ValidateFunctionArgumentsSuccessAutoMap = {
  state: "success";
  parameterType: VariableType | null;
  resultType: VariableType;
  autoMap: boolean;
}

export function newValidateFunctionArgumentsSuccessAutoMap(parameterType: VariableType, resultType: VariableType): ValidateFunctionArgumentsSuccessAutoMap {
  return {
    state: "success",
    autoMap: true,
    parameterType: parameterType,
    resultType: resultType
  } as const;
}

export function asValidateFunctionArgumentsAutoMapResult(value: any) {
  return value.state == "success" && value.autoMap ? value as ValidateFunctionArgumentsSuccessAutoMap : null;
}

export type ValidateFunctionArgumentsCallFunctionResult = {
  state: "success";
  autoMap: false;
  function: FunctionSignature;
}

export function newValidateFunctionArgumentsCallFunctionSuccess(functionSignature: FunctionSignature): ValidateFunctionArgumentsCallFunctionResult {
  return {
    state: "success",
    autoMap: false,
    function: functionSignature
  } as const;
}

export function asValidateFunctionArgumentsCallFunctionResult(value: any) {
  return value.state == "success" && !value.autoMap ? value as ValidateFunctionArgumentsCallFunctionResult : null;
}

export type ValidateFunctionArgumentsResult = ValidateFunctionArgumentsFailed
                                            | ValidateFunctionArgumentsSuccessAutoMap
                                            | ValidateFunctionArgumentsCallFunctionResult;
