export enum FunctionCallType {
  LibraryFunctionCall = "LibraryFunctionCall",
  LookUpFunctionCall = "LookUpFunctionCall",
  LookUpRowFunctionCall = "LookUpRowFunctionCall",
}

export interface IInstanceFunctionCall {
  functionCallType: FunctionCallType;
}