import {Type} from "../language/typeSystem/type";
import {FunctionCallStateType, IFunctionCallState} from "../language/typeSystem/functions/functionCallState";
import {Symbol} from "../language/symbols/symbol";
import {SourceReference} from "../language/sourceReference";
import {SymbolKind} from "../language/symbols/symbolKind";

export function instanceOfLibraryFunctionCallState(object: any): object is LibraryFunctionCallState {
  return object?.functionCallStateType == FunctionCallStateType.LibraryFunction;
}

export function asLibraryFunctionCallState(object: any): LibraryFunctionCallState | null {
  return instanceOfLibraryFunctionCallState(object) ? object as LibraryFunctionCallState : null;
}

export class LibraryFunctionCallState implements IFunctionCallState {

  public readonly functionCallStateType = FunctionCallStateType.LibraryFunction;

  public libraryName: string;
  public functionName: string;
  public returnType: Type;
  public reference: SourceReference;

  constructor(reference: SourceReference, libraryName: string, functionName: string, returnType: Type) {
    this.reference = reference;
    this.libraryName = libraryName;
    this.functionName = functionName;
    this.returnType = returnType;
  }

  public getSymbol(): Symbol {
    return new Symbol(this.reference, this.libraryName + "." + this.functionName, "", SymbolKind.LibraryFunction);
  }
}
