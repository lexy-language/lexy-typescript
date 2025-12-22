import {ExecutionContext} from "../runTime/executionContext";
import {FunctionResult} from "../runTime/functionResult";
import {ILogger} from "../infrastructure/logger";
import {GeneratedType} from "./generatedType";
import {LexyCodeConstants} from "./javaScript/lexyCodeConstants";
import {VariablePathParser} from "../language/scenarios/variablePathParser";
import Decimal from "decimal.js";
import {deepCopy} from "../infrastructure/deepCopy";

export class ExecutableFunction {
  private readonly environment: any;
  private readonly functionReference: Function;
  private readonly logger: ILogger;

  constructor(environment: any, functionReference: Function, logger: ILogger) {
    this.environment = environment;
    this.functionReference = functionReference;
    this.logger = logger;
  }

  public run(values: { [key: string]: any } | null = null): FunctionResult {
    const parameters = this.getParameters(values);
    const context = new ExecutionContext(this.logger);
    const results = this.functionReference(this.environment, parameters, context);
    return new FunctionResult(deepCopy(results), context.entries);
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
    let currentReference = VariablePathParser.parseString(key);
    let currentValue = parameters;
    while (currentReference.hasChildIdentifiers) {
      currentValue = parameters[currentReference.parentIdentifier];
      currentReference = currentReference.childrenReference();
    }

    return (value: any) => currentValue[currentReference.parentIdentifier] = value;
  }

  static create(environment: any, generatedType: GeneratedType, compilationLogger: ILogger, executionLogger: ILogger) {
    const code = `
const ${LexyCodeConstants.parameterVariable} = new ${LexyCodeConstants.environmentVariable}.${generatedType.name}.${LexyCodeConstants.parametersType}();
${LexyCodeConstants.environmentVariable}.${generatedType.name}.${LexyCodeConstants.validateMethod}(parameters);
${LexyCodeConstants.environmentVariable}.systemFunctions.populate(${LexyCodeConstants.parameterVariable}, parameters);
return ${LexyCodeConstants.environmentVariable}.${generatedType.name}(${LexyCodeConstants.parameterVariable}, context);`;

    compilationLogger.logDebug(`Execution code: ${code}`)

    const functionReference = new Function(LexyCodeConstants.environmentVariable, "parameters", "context", code);
    return new ExecutableFunction(environment, functionReference, executionLogger);
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