import type {ILexyCompiler} from "../compiler/lexyCompiler";
import type {IParserLogger} from "../parser/parserLogger";
import type {ISpecificationRunnerContext} from "./specificationRunnerContext";

import {CompilerResult} from "../compiler/compilerResult";
import {Function} from "../language/functions/function";
import {Scenario} from "../language/scenarios/scenario";
import {RootNodeList} from "../language/rootNodeList";
import {format} from "../infrastructure/formatting";
import {FunctionResult} from "../runTime/functionResult";
import {any, firstOrDefault} from "../infrastructure/enumerableExtensions";
import {Parameters} from "../language/scenarios/parameters";
import {FunctionParameters} from "../language/functions/functionParameters";
import {IRootNode} from "../language/rootNode";
import {ExecutableFunction} from "../compiler/executableFunction";
import {asAssignmentDefinition, AssignmentDefinition} from "../language/scenarios/assignmentDefinition";
import {Assert} from "../infrastructure/assert";
import {DependencyGraphFactory} from "../dependencyGraph/dependencyGraphFactory";
import validateExecutionLogging from "./validateExecutionLogging";
import {ExecutionLogEntry} from "../runTime/executionContext";

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
  private readonly parserLogger: IParserLogger;
  private readonly rootNodeList: RootNodeList;

  private functionNode: Function | null = null;

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
  }

  public run(): void {
    this.functionNode = this.getFunctionNode(this.scenario, this.rootNodeList);
    if (this.parserLogger.nodeHasErrors(this.scenario) && this.scenario.expectExecutionErrors == null) {
      this.fail(`Parsing scenario failed.`, this.parserLogger.errorNodeMessages(this.scenario));
      return;
    }

    if (!this.validateErrors()) return;

    const functionNode = Assert.notNull(this.functionNode, "functionNode");
    const nodes = functionNode.getFunctionAndDependencies(this.rootNodeList);
    const compilerResult = this.compile(nodes);
    const executable = compilerResult.getFunction(functionNode);
    const values = this.getValues(this.scenario.parameters, functionNode.parameters, compilerResult);

    const result = this.runFunction(executable, values);
    if (result == null) return;

    if (!this.validateExecutionLogging(result)) return;

    const validationResultText = this.validateResult(result, compilerResult);
    if (validationResultText.length > 0) {
      this.fail("Results validation failed.", validationResultText);
    } else {
      this.context.success(this.scenario, result.logging);
    }
  }

  private getFunctionNode(scenario: Scenario, rootNodeList: RootNodeList): Function | null {
    if (scenario.functionNode != null) {
      return scenario.functionNode;
    }
    if (scenario.functionName?.hasValue) {
      const functionNode = rootNodeList.getFunction(scenario.functionName.value);
      if (functionNode == null) {
        this.fail(`Unknown function: ` + scenario.functionName, this.parserLogger.errorNodeMessages(this.scenario));
      }
      return functionNode;
    }
    return null;
  }

  private runFunction(executable: ExecutableFunction, values: { [key: string]: any } | null) {
    try {
      return executable.run(values);
    } catch (error: any) {
      if (!this.validateExecutionErrors(error)) {
        this.fail('Execution error occurred.', [
          "Error: ", error.stack])
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

  private fail(message: string, errors: string[] | null = null): void {
    this.failedValue = true;
    this.context.fail(this.scenario, message, errors);
  }

  private validateResult(result: FunctionResult, compilerResult: CompilerResult): Array<string> {
    const validationResult: Array<string> = [];
    if (this.scenario.results != null) {
      this.evaluateResults(this.scenario.results.allAssignments(), result, compilerResult, validationResult);
    }
    return validationResult;
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
      this.fail(`Scenario has no function, enum or table.`, []);
      return false;
    }

    const dependencies = DependencyGraphFactory.nodeAndDependencies(this.rootNodeList, node);
    const failedMessages = this.parserLogger.errorNodesMessages(dependencies);

    if (failedMessages.length > 0 && !this.scenario.expectError?.hasValue) {
      this.fail(`Parsing errors: ${failedMessages.length}`, failedMessages);
      return false;
    }

    if (!this.scenario.expectError?.hasValue) return true;

    if (failedMessages.length == 0) {
      this.fail(`Error expected: ${this.scenario.expectError.message}`, []);
      return false;
    }

    if (!any(failedMessages, message => this.scenario.expectError?.hasValue == true && message.includes(this.scenario.expectError.message))) {
      this.fail(`Wrong error occurred.`, [
        "Expected: " + this.scenario.expectError.message,
        "Actual: ", ...failedMessages]);
      return false;
    }

    this.context.success(this.scenario, null);
    return false;
  }

  private validateRootErrors(): boolean {
    const expected = this.scenario.expectRootErrors != null ? this.scenario.expectRootErrors?.messages : [];
    let failedMessages = this.parserLogger.errorMessages();
    if (!any(failedMessages)) {
      this.fail(`Root errors expected. No errors occurred.`, [
        "Expected:", ...expected]);
      return false;
    }

    let failed = false;
    if (this.scenario.expectRootErrors) {
      for (const rootMessage of expected) {
        let failedMessage = firstOrDefault(failedMessages, message => message.includes(rootMessage));
        if (failedMessage != null) {
          failedMessages = failedMessages.filter(item => item !== failedMessage);
        } else {
          failed = true;
        }
      }
    }

    if (!any(failedMessages) && !failed) {
      this.context.success(this.scenario, null);
      return false; // don't compile and run rest of scenario
    }

    this.fail(`Wrong error(s) occurred.`, [
        "Expected:", ...expected,
        "Actual:", ...this.parserLogger.errorMessages()]);
    return false;
  }

  private getValues(scenarioParameters: Parameters | null,
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
                       result: { [key: string]: any }) {

    const assignmentDefinition = Assert.notNull(asAssignmentDefinition(parameter), "assignmentDefinition");
    let type = firstOrDefault(functionParameters.variables, variable => variable.name == assignmentDefinition.variable.parentIdentifier);

    if (type == null) {
      throw new Error(`Function '${this.functionNode?.name?.value}' parameter '${assignmentDefinition.variable.parentIdentifier}' not found.`);
    }

    if (assignmentDefinition.variableType == null) throw new Error("parameter.variableType is null")
    const value = ScenarioRunner.getValue(assignmentDefinition);

    let valueObject = result;
    let reference = assignmentDefinition.variable;
    while (reference.hasChildIdentifiers) {
      if (!valueObject[reference.parentIdentifier]) {
        valueObject[reference.parentIdentifier] = {};
      }
      valueObject = valueObject[reference.parentIdentifier];
      reference = reference.childrenReference();
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
      this.fail(`Execution error not found`, [
        'Not found:', ...expected,
        'Actual:', ...errorMessage]);
    }

    return true;
  }

  private validateExecutionLogging(result: FunctionResult) {
    if (this.scenario.executionLogging == null) return true;
    const errors = validateExecutionLogging(result.logging, this.scenario.executionLogging.entries);
    if (errors != null) {
      this.fail("Invalid Execution Logging", errors);
      return false;
    }
    return true;
  }
}