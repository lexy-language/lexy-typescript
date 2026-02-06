import {Symbol} from "../../symbols/symbol";

export enum FunctionCallStateType {
  LookUp = "LookUp",
  LookUpRow = "LookUpRow",
  LibraryFunction = "LibraryFunction",
}

export interface IFunctionCallState {
  getSymbol(): Symbol;
  functionCallStateType: FunctionCallStateType;
}
