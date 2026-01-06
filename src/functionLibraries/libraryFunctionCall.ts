import {VariableType} from "../language/variableTypes/variableType";
import {IMemberFunctionCall, MemberFunctionCallType} from "../language/variableTypes/functions/memberFunctionCall";

export function instanceOfLibraryFunctionCall(object: any): object is LibraryFunctionCall {
  return object?.functionCallType == MemberFunctionCallType.LibraryFunctionCall;
}

export function asLibraryFunctionCall(object: any): LibraryFunctionCall | null {
  return instanceOfLibraryFunctionCall(object) ? object as LibraryFunctionCall : null;
}

export class LibraryFunctionCall implements IMemberFunctionCall {

  public readonly functionCallType = MemberFunctionCallType.LibraryFunctionCall;

  public libraryName: string;
  public functionName: string;
  public returnType: VariableType;

  constructor(libraryName: string, functionName: string, returnType: VariableType) {
    this.libraryName = libraryName;
    this.functionName = functionName;
    this.returnType = returnType;
  }
}