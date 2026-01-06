import {VariableUsage} from "../variableUsage";
import {VariableType} from "../../variableTypes/variableType";
import {Expression} from "../expression";

export interface ILexyFunctionCall {
  functionCallType: LexyFunctionCallType;
  usedVariables(): ReadonlyArray<VariableUsage>;
}

export enum LexyFunctionCallType {
  AutoMapLexyFunctionCall,
  LexyFunctionCall
}

export function instanceOfLexyFunctionCall(object: any): object is LexyFunctionCall {
  return object?.functionCallType == LexyFunctionCallType.LexyFunctionCall;
}

export function asLexyFunctionCall(object: any): LexyFunctionCall | null {
  return instanceOfLexyFunctionCall(object) ? object as LexyFunctionCall : null;
}

export class LexyFunctionCall implements ILexyFunctionCall {

  public readonly functionCallType = LexyFunctionCallType.LexyFunctionCall;

  public parametersTypes: ReadonlyArray<VariableType>;
  public resultsType: VariableType;
  public argumentExpressions: ReadonlyArray<Expression>;

  constructor(parametersTypes: ReadonlyArray<VariableType>, resultsType: VariableType,
              argumentExpressions: ReadonlyArray<Expression>) {
    this.parametersTypes = parametersTypes;
    this.resultsType = resultsType;
    this.argumentExpressions = argumentExpressions;
  }

  public usedVariables(): ReadonlyArray<VariableUsage> {
    //returned by FunctionCallExpression.UsedVariables;
    return [];
  }
}