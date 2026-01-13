import type {ILogger} from "../../infrastructure/logger";
import type {ILibraries} from "../../functionLibraries/libraries";

import {GeneratedType, GeneratedTypeKind} from "../generatedType";
import {CompilerResult} from "../compilerResult";
import {ExecutableFunction} from "../executableFunction";
import {LexyCodeConstants} from "./lexyCodeConstants";
import {TableLibrary} from "../../runTime/libraries/tableLibrary";
import {SystemFunctions} from "../../runTime/systemFunctions";
import {Validate} from "../../runTime/validate";
import Decimal from "decimal.js";

export interface ICompilationEnvironment {
  addType(generatedType: GeneratedType): void;
  initialize(): void;
  result(): CompilerResult;
}

export class CompilationEnvironment implements ICompilationEnvironment {

  private readonly generatedTypes: Array<GeneratedType> = [];
  private readonly enums: { [key: string]: GeneratedType } = {};
  private readonly executables: { [key: string]: ExecutableFunction } = {};
  private readonly tables: { [key: string]: GeneratedType } = {};
  private readonly types: { [key: string]: GeneratedType } = {};
  private readonly executionLogger: ILogger;
  private readonly compilationLogger: ILogger;

  public readonly codeEnvironment: any;

  constructor(compilationLogger: ILogger, executionLogger: ILogger, libraries: ILibraries) {
    this.compilationLogger = compilationLogger;
    this.executionLogger = executionLogger;
    this.codeEnvironment = {
      tableLibrary: TableLibrary,
      libraries: {},
      systemFunctions: SystemFunctions,
      validate: Validate,
      Decimal: Decimal
    }

    for (const library of libraries.runtimes()) {
      this.codeEnvironment.libraries[library.name] = library;
    }
  }

  public initialize(): void {
    for (const generatedType of this.generatedTypes) {
      this.initializeType(generatedType);
    }
  }

  public addType(generatedType: GeneratedType): void {
    this.generatedTypes.push(generatedType);
  }

  public result(): CompilerResult {
    return new CompilerResult(this.executables, this.enums, this, this.executionLogger);
  }

  private initializeType(generatedType: GeneratedType): void {
    const code = `"use strict";
${LexyCodeConstants.environmentVariable}.${generatedType.name} = ${generatedType.initializationFunction}
`;

    try {
      this.compilationLogger.logDebug(`Initialization code: ${code}`)
      const initialization = new Function(LexyCodeConstants.environmentVariable, code);
      initialization(this.codeEnvironment);
    } catch (error: any) {
      throw new Error(`Initialization failed: ${error}
${code}`)
    }

    switch (generatedType.kind) {
      case GeneratedTypeKind.Function: {
        const executable = ExecutableFunction.create(this.codeEnvironment, generatedType, this.compilationLogger, this.executionLogger);
        this.executables[generatedType.node.nodeName] = executable;
        break;
      }
      case GeneratedTypeKind.Enum: {
        this.enums[generatedType.node.nodeName] = generatedType;
        break;
      }
      case GeneratedTypeKind.Table: {
        this.tables[generatedType.node.nodeName] = generatedType;
        break;
      }
      case GeneratedTypeKind.Type: {
        this.types[generatedType.node.nodeName] = generatedType;
        break;
      }
      default: {
        throw new Error(`Unknown generated type: ${generatedType.kind}`);
      }
    }
  }
}
