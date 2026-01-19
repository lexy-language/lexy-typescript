export enum MemberFunctionCallType {
  LibraryFunctionCall = "LibraryFunctionCall",
  LookUpFunctionCall = "LookUpFunctionCall",
  LookUpRowFunctionCall = "LookUpRowFunctionCall",
}

export interface IMemberFunctionCall {
  functionCallType: MemberFunctionCallType;
}