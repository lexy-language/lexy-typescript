import type {ILexyCompiler} from "../compiler/lexyCompiler";
import type {IParserLogger} from "../parser/parserLogger";
import type {ISpecificationRunnerContext} from "./specificationRunnerContext";

import {CompilerResult} from "../compiler/compilerResult";
import {Function} from "../language/functions/function";
import {Scenario} from "../language/scenarios/scenario";
import {RootNodeList} from "../language/rootNodeList";
import {format} from "../infrastructure/formatting";
import {FunctionResult} from "../runTime/functionResult";
import {TypeConverter} from "./typeConverter";
import {any, firstOrDefault} from "../infrastructure/enumerableExtensions";
import {ScenarioParameters} from "../language/scenarios/scenarioParameters";
import {FunctionParameters} from "../language/functions/functionParameters";
import {VariableType} from "../language/variableTypes/variableType";
import {IRootNode} from "../language/rootNode";
import {ExecutableFunction} from "../compiler/executableFunction";
import {asAssignmentDefinition, AssignmentDefinition} from "../language/scenarios/assignmentDefinition";
import {Assert} from "../infrastructure/assert";
import {DependencyGraphFactory} from "../dependencyGraph/dependencyGraphFactory";
import {
  asComplexAssignmentDefinition,
  ComplexAssignmentDefinition
} from "../language/scenarios/complexAssignmentDefinition";
import {asEnumType} from "../language/variableTypes/enumType";

export interface IScenarioRunner {
  failed: boolean;
  scenario: Scenario;

  run(): void;

  parserLogging(): string;
}

export class ScenarioRunner implements IScenarioRunner {

  private readonly context: ISpecificationRunnerContext;
  private readonly compiler: ILexyCompiler;
  private readonly fileName: string;
  private readonly functionNode: Function | null = null;
  private readonly parserLogger: IParserLogger;
  private readonly rootNodeList: RootNodeList;

  private failedValue: boolean = false;

  public get failed(): boolean {
    return this.failedValue;
  }

  public readonly scenario: Scenario

  constructor(fileName: string, compiler: ILexyCompiler, rootNodeList: RootNodeList, scenario: Scenario,
              context: ISpecificationRunnerContext, parserLogger: IParserLogger) {
    this.fileName = fileName;
    this.compiler = compiler;
    this.context = context;
    this.rootNodeList = rootNodeList;
    this.parserLogger = parserLogger;

    this.scenario = scenario;
    this.functionNode = ScenarioRunner.getFunctionNode(scenario, rootNodeList);
  }

  private static getFunctionNode(scenario: Scenario, rootNodeList: RootNodeList): Function | null {
    if (scenario.functionNode != null) {
      return scenario.functionNode;
    }
    if (scenario.functionName?.hasValue) {
      return rootNodeList.getFunction(scenario.functionName.value);
    }
    return null;
  }

  public run(): void {
    if (this.parserLogger.nodeHasErrors(this.scenario) && this.scenario.expectExecutionErrors == null) {
      this.fail(` Parsing scenario failed: ${this.scenario.functionName}`);
      this.parserLogger.errorNodeMessages(this.scenario)
        .forEach(message => this.context.logGlobal(message));
      return;
    }

    if (!this.validateErrors()) return;

    const functionNode = Assert.notNull(this.functionNode, "this.functionNode");
    const nodes = functionNode.getFunctionAndDependencies(this.rootNodeList);
    const compilerResult = this.compile(nodes);
    const executable = compilerResult.getFunction(functionNode);
    const values = this.getValues(this.scenario.parameters, functionNode.parameters, compilerResult);

    const result = this.runFunction(executable, values);
    if (result == null) return;

    const validationResultText = this.getValidationResult(result, compilerResult);
    if (validationResultText.length > 0) {
      this.fail(validationResultText);
    } else {
      this.context.success(this.scenario);
    }
  }

  private runFunction(executable: ExecutableFunction, values: { [key: string]: any } | null) {
    try {
      return executable.run(values);
    } catch (error: any) {
      if (!this.validateExecutionErrors(error)) {
        this.fail('No execution error expected. Execution raised: ' + error.stack)
      }
      return null;
    }
  }

  private compile(nodes: Array<IRootNode>) {
    try {
      return this.compiler.compile(nodes);
    } catch (error: any) {
      throw new Error("Exception occurred while compiling scenario '" + this.scenario.name + "' from '" + this.fileName + "'\n" + error.stack)
    }
  }

  public parserLogging(): string {
    return `------- Filename: ${this.fileName}\n${format(this.parserLogger.errorMessages(), 2)}`;
  }

  private fail(message: string): void {
    this.failedValue = true;
    this.context.fail(this.scenario, message);
  }

  private getValidationResult(result: FunctionResult, compilerResult: CompilerResult): string {
    const validationResult: Array<string> = [];
    if (this.scenario.results != null) {
      this.evaluateResults(this.scenario.results.allAssignments(), result, compilerResult, validationResult);
    }
    return validationResult.join('\n');
  }

  private evaluateResults(assignments: ReadonlyArray<AssignmentDefinition>, result: FunctionResult, compilerResult: CompilerResult, validationResult: Array<string>) {
    for (const expected of assignments) {
      this.evaluateResult(expected, result, compilerResult, validationResult);
    }
  }

  private evaluateResult(expected: AssignmentDefinition, result: FunctionResult, compilerResult: CompilerResult, validationResult: Array<string>) {
    const assignmentDefinition = Assert.notNull(asAssignmentDefinition(expected), "assignmentDefinition");
    if (assignmentDefinition.variableType == null) throw new Error("expected.variableType is null")
    let actual = result.getValue(assignmentDefinition.variable);
    let expectedValue = assignmentDefinition.constantValue.value;

    if (actual == null || expectedValue == null || !ScenarioRunner.compare(actual, expectedValue)) {
      validationResult.push(
        `'${assignmentDefinition.variable}' should be '${expectedValue ?? `<null>`}' (${expectedValue?.constructor.name}) but is '${actual ?? `<null>`} (${actual?.constructor.name})'`);
    }
  }

  private validateErrors(): boolean {
    if (this.scenario.expectRootErrors?.hasValues) return this.validateRootErrors();

    let node = this.functionNode
      ?? this.scenario.functionNode
      ?? this.scenario.enum
      ?? this.scenario.table;
    if (node == null) {
      this.fail(`Scenario has no function, enum or table.`);
      return false;
    }

    const dependencies = DependencyGraphFactory.nodeAndDependencies(this.rootNodeList, node);
    const failedMessages = this.parserLogger.errorNodesMessages(dependencies);

    if (failedMessages.length > 0 && !this.scenario.expectError?.hasValue) {
      this.fail(`Exception occurred: ${format(failedMessages, 2)}`);
      return false;
    }

    if (!this.scenario.expectError?.hasValue) return true;

    if (failedMessages.length == 0) {
      this.fail(`No exception \n` +
        ` Expected: ${this.scenario.expectError.message}\n`);
      return false;
    }

    if (!any(failedMessages, message => this.scenario.expectError?.hasValue == true && message.includes(this.scenario.expectError.message))) {
      this.fail(`Wrong exception \n` +
        ` Expected: ${this.scenario.expectError.message}\n` +
        ` Actual: ${format(failedMessages, 4)}`);
      return false;
    }

    this.context.success(this.scenario);
    return false;
  }

  private validateRootErrors(): boolean {
    let failedMessages = this.parserLogger.errorMessages();
    if (!any(failedMessages)) {
      this.fail(`No exceptions \n` +
        ` Expected: ${format(this.scenario.expectRootErrors?.messages, 4)}{Environment.NewLine}` +
        ` Actual: none`);
      return false;
    }

    let failed = false;
    if (this.scenario.expectRootErrors) {
      for (const rootMessage of this.scenario.expectRootErrors?.messages) {
        let failedMessage = firstOrDefault(failedMessages, message => message.includes(rootMessage));
        if (failedMessage != null) {
          failedMessages = failedMessages.filter(item => item !== failedMessage);
        } else {
          failed = true;
        }
      }
    }

    if (!any(failedMessages) && !failed) {
      this.context.success(this.scenario);
      return false; // don't compile and run rest of scenario
    }

    this.fail(`Wrong exception \n` +
      ` Expected: ${format(this.scenario.expectRootErrors?.messages, 4)}\n` +
      ` Actual: ${format(this.parserLogger.errorMessages(), 4)}`);
    return false;
  }

  private getValues(scenarioParameters: ScenarioParameters | null,
                    functionParameters: FunctionParameters | null,
                    compilerResult: CompilerResult): { [key: string]: any } {
    let result = {};
    if (scenarioParameters != null) {
      if (functionParameters != null) {
        this.setParameters(scenarioParameters.allAssignments(), functionParameters, compilerResult, result);
      }
    }
    return result;
  }

  private setParameters(parameters: ReadonlyArray<AssignmentDefinition>, functionParameters: FunctionParameters, compilerResult: CompilerResult, result: {}) {
    for (const parameter of parameters) {
      this.setParameter(functionParameters, parameter, compilerResult, result);
    }
  }

  private setParameter(functionParameters: FunctionParameters,
                       parameter: AssignmentDefinition,
                       compilerResult: CompilerResult,
                       result: {[key: string]: any}) {

    const assignmentDefinition = Assert.notNull(asAssignmentDefinition(parameter), "assignmentDefinition");
    let type = firstOrDefault(functionParameters.variables, variable => variable.name == assignmentDefinition.variable.parentIdentifier);

    if (type == null) {
      throw new Error(`Function '${this.functionNode?.name?.value}' parameter '${assignmentDefinition.variable.parentIdentifier}' not found.`);
    }

    if (assignmentDefinition.variableType == null) throw new Error("parameter.variableType is null")
    const value = ScenarioRunner.getValue(assignmentDefinition);

    let valueObject = result;
    let reference = assignmentDefinition.variable;
    while(reference.hasChildIdentifiers) {
      if (!valueObject[reference.parentIdentifier]) {
        valueObject[reference.parentIdentifier] = {};
      }
      valueObject = valueObject[reference.parentIdentifier];
      reference = reference.childrenReference();

      //todo verify var types of nested parameters
    }
    valueObject[reference.parentIdentifier] = value;
  }

  private static getValue(assignmentDefinition: AssignmentDefinition) {
    return assignmentDefinition.constantValue.value;
  }

  private static compare(actual: any, expectedValue: any): boolean {
    if (expectedValue?.constructor == Date && actual?.constructor == Date) {
      return actual.toISOString() == expectedValue.toISOString();
    }
    return actual == expectedValue;
  }

  private validateExecutionErrors(error: any): boolean {
    if (!this.scenario.expectExecutionErrors) return false;

    const errorMessage = error.message as string;
    const failedErrors = [];
    let expected = [...this.scenario.expectExecutionErrors.messages];
    for (const error of this.scenario.expectExecutionErrors.messages) {
      if (!errorMessage.includes(error)) {
        failedErrors.push(error);
      } else {
        expected = expected.filter(where => where !== error)
      }
    }

    if (failedErrors.length > 0) {
      this.fail(`Execution error not found\n` +
        ` Not found: ${format(expected, 2)}\n` +
        ` Actual: ${errorMessage}`)
    }

    return true;
  }
}