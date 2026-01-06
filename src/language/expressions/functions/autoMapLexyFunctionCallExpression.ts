import {Mapping, mapToUsedVariable} from "./mapping";
import {VariableType} from "../../variableTypes/variableType";
import {VariableUsage} from "../variableUsage";
import {VariableAccess} from "../variableAccess";
import {ILexyFunctionCall, LexyFunctionCallType} from "./lexyFunctionCall";

export function instanceOfAutoMapLexyFunctionCall(object: any): object is AutoMapLexyFunctionCall {
  return object?.functionCallType == LexyFunctionCallType.AutoMapLexyFunctionCall;
}

export function asAutoMapLexyFunctionCall(object: any): AutoMapLexyFunctionCall | null {
  return instanceOfAutoMapLexyFunctionCall(object) ? object as AutoMapLexyFunctionCall : null;
}

export class AutoMapLexyFunctionCall implements ILexyFunctionCall {

  public readonly functionCallType = LexyFunctionCallType.AutoMapLexyFunctionCall;

  private readonly mappingParametersValue: ReadonlyArray<Mapping> = [];
  private readonly mappingResultsValue: ReadonlyArray<Mapping> = [];

  public parametersTypes: VariableType;
  public resultsType: VariableType;


  public get mappingParameters(): ReadonlyArray<Mapping> {
    return this.mappingParametersValue;
  }

  public get mappingResults(): ReadonlyArray<Mapping> {
    return this.mappingResultsValue;
  }

  constructor(mappingParameters: ReadonlyArray<Mapping>, mappingResults: ReadonlyArray<Mapping>,
              parametersTypes: VariableType, resultsType: VariableType) {
    this.parametersTypes = parametersTypes;
    this.resultsType = resultsType;
    this.mappingParametersValue = mappingParameters;
    this.mappingResultsValue = mappingResults;
  }

  public usedVariables(): ReadonlyArray<VariableUsage> {
    return [
      ...this.mappingParameters.map(mapToUsedVariable(VariableAccess.Read)),
      ...this.mappingResults.map(mapToUsedVariable(VariableAccess.Write))
    ];
  }
}
