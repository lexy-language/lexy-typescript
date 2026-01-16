import type {ILogger} from "../infrastructure/logger";

import {ExecutionContext} from "../runTime/executionContext";
import {FunctionResult} from "../runTime/functionResult";
import {GeneratedType} from "./generatedType";
import {LexyCodeConstants} from "./javaScript/lexyCodeConstants";
import Decimal from "decimal.js";
import {deepCopy} from "../infrastructure/deepCopy";
import {IdentifierPath} from "../language/identifierPath";
import {Function as FunctionNode} from "../language/functions/function";

export class ExecutableFunction {

  private readonly environment: any;
  private readonly functionReference: Function;
  private readonly logger: ILogger;
  private readonly functionNode: FunctionNode;

  constructor(functionNode: FunctionNode, environment: any, functionReference: Function, logger: ILogger) {
    this.environment = environment;
    this.functionReference = functionReference;
    this.logger = logger;
    this.functionNode = functionNode;
  }

  public run(values: { [key: string]: any } | null = null): FunctionResult {
    const parameters = this.getParameters(values);
    const context = new ExecutionContext(this.logger);
    const results = this.functionReference(this.environment, parameters, context);
    return new FunctionResult(this.functionNode, deepCopy(results), context.entries);
  }

  private getParameters(values: { [p: string]: any } | null) {
    let parameters = {};

    if (values == null) return parameters;

    for (const key in values) {
      const value = values[key];
      let field = this.getParameterSetter(parameters, key);
      let convertedValue = this.changeType(value);
      field(convertedValue);
    }
    return parameters;
  }

  private getParameterSetter(parameters: any, key: string): ((value: any) => void) {
    let currentReference = IdentifierPath.parseString(key);
    let currentValue = parameters;
    while (currentReference.hasChildIdentifiers) {
      currentValue = parameters[currentReference.rootIdentifier];
      currentReference = currentReference.childrenReference();
    }

    return (value: any) => currentValue[currentReference.rootIdentifier] = value;
  }

  static create(environment: any, generatedType: GeneratedType, compilationLogger: ILogger, executionLogger: ILogger) {
    const code = `
const ${LexyCodeConstants.parameterVariable} = new ${LexyCodeConstants.environmentVariable}.${generatedType.name}.${LexyCodeConstants.parametersType}();
${LexyCodeConstants.environmentVariable}.${generatedType.name}.${LexyCodeConstants.validateMethod}(parameters);
${LexyCodeConstants.environmentVariable}.systemFunctions.populate(${LexyCodeConstants.parameterVariable}, parameters);
return ${LexyCodeConstants.environmentVariable}.${generatedType.name}(${LexyCodeConstants.parameterVariable}, context);`;

    compilationLogger.logDebug(`Execution code: ${code}`)

    const functionReference = new Function(LexyCodeConstants.environmentVariable, "parameters", "context", code);
    const functionNode = generatedType.node as FunctionNode;
    return new ExecutableFunction(functionNode, environment, functionReference, executionLogger);
  }

  private changeType<T>(value: any): any {
    if (value instanceof Date) return new Date(value) as T;
    if (typeof value === 'number') return Decimal(value);
    if (typeof value !== 'object' || value === null) return value;
    if (Array.isArray(value)) return value.map(item => this.changeType(item)) as unknown as T;
    const copy = {} as { [K in keyof T]: T[K] };
    Object.keys(value).forEach(key => {
      if (key.startsWith("__")) return;
      copy[key as keyof T] = this.changeType((value as { [key: string]: any })[key]);
    });
    return copy;
  }
}
