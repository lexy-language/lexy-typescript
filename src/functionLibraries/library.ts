import type {IObjectTypeFunction} from "../language/variableTypes/objectTypeFunction";

import {LibraryFunctionInfo, LibraryRuntime} from "../runTime/libraries/libraryRuntime";
import {LibraryFunction} from "./libraryFunction";
import {Assert} from "../infrastructure/assert";

export interface ILibrary {
  name: string;
  runTime: LibraryRuntime;
  getFunction(identifier: string): IObjectTypeFunction;
}

export class Library implements ILibrary {

  private readonly functions: {[key: string]: LibraryFunction};

  public runTime: LibraryRuntime;
  public name: string;

  private constructor(runTime: LibraryRuntime, functions: {[key: string]: LibraryFunction}) {
    this.runTime = Assert.notNull(runTime, "runTime");
    this.name = runTime.name;
    this.functions = Assert.notNull(functions, "functions");
  }

  public getFunction(identifier: string): IObjectTypeFunction {
    return this.functions[identifier] ?? null;
  }

  public static build(library: LibraryRuntime): Library {
    const functions = Library.buildFunctions(library);
    return new Library(library, functions);
  }

  private static buildFunctions(libraryType: LibraryRuntime): {[key: string]: LibraryFunction} {
    const result = {};
    for(let name in libraryType.functionsInfo) {
      let functionsInfo = libraryType.functionsInfo[name];
      this.buildFunction(libraryType.name, result, name, functionsInfo);
    }
    return result;
  }

  private static buildFunction(libraryName: string, result: {[key: string]: LibraryFunction}, name: string, functionInfo: LibraryFunctionInfo): void {
    if (result[name]) {
      throw new Error(`Duplicated function '${name}' in library '${libraryName}'. Overloads are not supported.`);
    }
    result[name] = LibraryFunction.build(libraryName, name, functionInfo);
  }
}