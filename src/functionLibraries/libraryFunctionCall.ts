import {IdentifierPath} from "../language/identifierPath";
import {VariableType} from "../language/variableTypes/variableType";
import {FunctionCallType, IInstanceFunctionCall} from "../language/functions/IInstanceFunctionCall";

export function instanceOfLibraryFunctionCall(object: any): object is LibraryFunctionCall {
  return object?.functionCallType == FunctionCallType.LibraryFunctionCall;
}

export function asLibraryFunctionCall(object: any): LibraryFunctionCall | null {
  return instanceOfLibraryFunctionCall(object) ? object as LibraryFunctionCall : null;
}

export class LibraryFunctionCall implements IInstanceFunctionCall {

  public readonly functionCallType = FunctionCallType.LibraryFunctionCall;

  public libraryName: string;
  public functionName: string;
  public returnType: VariableType;

  constructor(libraryName: string, functionName: string, returnType: VariableType) {
    this.libraryName = libraryName;
    this.functionName = functionName;
    this.returnType = returnType;
  }
}