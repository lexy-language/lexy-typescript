import {Type} from "../language/typeSystem/type";
import {IMemberFunctionCall, MemberFunctionCallType} from "../language/typeSystem/functions/memberFunctionCall";

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
  public returnType: Type;

  constructor(libraryName: string, functionName: string, returnType: Type) {
    this.libraryName = libraryName;
    this.functionName = functionName;
    this.returnType = returnType;
  }
}
