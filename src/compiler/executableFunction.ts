import {VariablePath} from "../language/variablePath";
import {ExecutionContext} from "../runTime/executionContext";
import {FunctionResult} from "../runTime/functionResult";
import {ILogger} from "../infrastructure/logger";
import {GeneratedType} from "./generatedType";
import {LexyCodeConstants} from "./javaScript/lexyCodeConstants";
import {VariablePathParser} from "../language/scenarios/variablePathParser";

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
    let parameters = this.getParameters(values);
    const context = new ExecutionContext(this.logger);
    let results = this.functionReference(this.environment, parameters, context);
    return new FunctionResult(results, context.entries);
  }

  private getParameters(values: { [p: string]: any } | null) {
    let parameters = {};

    if (values == null) return parameters;

    for (const key in values) {
      const value = values[key];
      let field = this.getParameterSetter(parameters, key);
      //let convertedValue = this.changeType(value, field.fieldType); // todo very variable type
      field(value);
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
}