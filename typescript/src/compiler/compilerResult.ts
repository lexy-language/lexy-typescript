import type {ICompilationEnvironment} from "./javaScript/compilationEnvironment";
import {ExecutableFunction} from "./executableFunction";
import {Function} from "../language/functions/function";
import {GeneratedType} from "./generatedType";
import {ExecutionContext, IExecutionContext} from "../runTime/executionContext";
import {ILogger} from "../infrastructure/logger";

export class CompilerResult {

  private enums: {[key: string]: GeneratedType};
  private executables: {[key: string]: ExecutableFunction};
  private environment: ICompilationEnvironment;
  private executionLogger: ILogger;

  constructor(executables: {[key: string]: ExecutableFunction}, enums: {[key: string]: GeneratedType},
              environment: ICompilationEnvironment, executionLogger: ILogger) {
    this.executables = executables;
    this.enums = enums;
    this.environment = environment;
    this.executionLogger = executionLogger;
  }

  public getFunction(functionNode: Function): ExecutableFunction {
    return this.executables[functionNode.name.value];
  }

  public getEnumType(type: string): any {
    return this.enums[type];
  }

  public createContext(): IExecutionContext {
    return new ExecutionContext(this.executionLogger);
  }
}
