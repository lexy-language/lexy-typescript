import type {ILexyCompiler} from "../compiler/lexyCompiler";
import type {IParserLogger} from "../parser/parserLogger";
import type {ISpecificationRunnerContext} from "./specificationRunnerContext";
import type {IRootNode} from "../language/rootNode";

import {Function} from "../language/functions/function";
import {Scenario} from "../language/scenarios/scenario";
import {RootNodeList} from "../language/rootNodeList";
import {format} from "../infrastructure/formatting";
import {FunctionResult} from "../runTime/functionResult";
import {any, firstOrDefault} from "../infrastructure/enumerableExtensions";
import {ExecutableFunction} from "../compiler/executableFunction";
import {asAssignmentDefinition, AssignmentDefinition} from "../language/scenarios/assignmentDefinition";
import {Assert} from "../infrastructure/assert";
import {DependencyGraphFactory} from "../dependencyGraph/dependencyGraphFactory";
import validateExecutionLogging from "./validateExecutionLogging";
import StringArrayBuilder from "../infrastructure/stringArrayBuilder";
import {getScenarioParameterValues, getTableRowValues} from "./mapValues";
import {VariablePathParser} from "../language/scenarios/variablePathParser";
import {VariablePath} from "../language/variablePath";
import {ValidationTableRow} from "../language/scenarios/validationTableRow";
import {ValidationTableValue} from "../language/scenarios/validationTableValue";

export interface IScenarioRunner {
  failed: boolean;
  scenario: Scenario;

  run(): void;

  parserLogging(): string;

  countScenarios(): number;
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

  public countScenarios(): number {
    return this.scenario.validationTable ? this.scenario.validationTable.rows.length : 1
  }

  public run(): void {
    this.functionNode = this.getFunctionNode(this.scenario, this.rootNodeList);
    if (this.parserLogger.nodeHasErrors(this.scenario) && this.scenario.expectExecutionErrors == null) {
      this.fail(`Parsing scenario failed.`, this.parserLogger.errorNodeMessages(this.scenario));
      return;
    }

    if (!this.validateErrors()) return;

    const functionNode = Assert.notNull(this.functionNode, "functionNode");
    const nodes = DependencyGraphFactory.nodeAndDependencies(this.rootNodeList, functionNode);
    const compilerResult = this.compile(nodes);
    const executable = compilerResult.getFunction(functionNode);
    if (this.scenario.validationTable != null) {
      this.runFunctionWithValidationTable(executable, functionNode);
    } else {
      const values = getScenarioParameterValues(functionNode, this.scenario.parameters, functionNode.parameters);
      this.runFunctionWithValues(values, null, executable);
    }
  }

  private runFunctionWithValidationTable(executable: ExecutableFunction, functionNode: Function) {
    if (this.scenario.validationTable == null || this.scenario.validationTable.header == null) return;
    for (const row of this.scenario.validationTable.rows) {
      const values = getTableRowValues(functionNode, this.scenario.validationTable.header, row);
      this.runFunctionWithValues(values, row, executable);
    }
  }

  private runFunctionWithValues(values: { [key: string]: any }, tableRow: ValidationTableRow | null, executable: ExecutableFunction) {

    const result = this.runFunction(executable, values);
    if (result == null) return;

    if (!this.validateExecutionLogging(result)) return;

    const validationResultText = this.validateResult(result, tableRow);
    if (validationResultText.length > 0) {
      this.fail("Results validation failed.", validationResultText, tableRow?.index);
    } else {
      this.context.success(this.scenario, result.logging, tableRow?.index);
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
        this.fail('Execution error occurred.', ["Error: ", error.stack])
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

  private fail(message: string, errors: ReadonlyArray<string> | null = null, index: number | null | undefined = null): void {
    this.failedValue = true;
    this.context.fail(this.scenario, message, errors, index);
  }

  private validateResult(result: FunctionResult, tableRow: ValidationTableRow | null): Array<string> {
    const validationResult: Array<string> = [];
    if (tableRow != null) {
      this.validateTableResults(tableRow, result, validationResult);
    }
    if (this.scenario.results != null) {
      ScenarioRunner.validateResults(this.scenario.results.allAssignments(), result, validationResult);
    }
    return validationResult;
  }

  private static validateResults(assignments: ReadonlyArray<AssignmentDefinition>, result: FunctionResult, validationResult: Array<string>) {
    for (const expected of assignments) {
      ScenarioRunner.validateResult(expected, result, validationResult);
    }
  }

  private static validateResult(expected: AssignmentDefinition, result: FunctionResult, validationResult: Array<string>) {
    const assignmentDefinition = Assert.notNull(asAssignmentDefinition(expected), "assignmentDefinition");
    if (assignmentDefinition.variableType == null) throw new Error("expected.variableType is null")
    let actual = result.getValue(assignmentDefinition.variable);
    let expectedValue = assignmentDefinition.constantValue.value;

    if (actual == null || expectedValue == null || !ScenarioRunner.compare(actual, expectedValue)) {
      validationResult.push(
        `'${assignmentDefinition.variable}' should be '${expectedValue ?? `<null>`}' (${expectedValue?.constructor.name}) but is '${actual ?? `<null>`}' (${actual?.constructor.name})`);
    }
  }

  private validateTableResults(tableRow: ValidationTableRow, result: FunctionResult, validationResult: Array<string>) {
    for (let index = 0; index < tableRow.values.length; index++) {
      const column = this.scenario.validationTable?.header?.getColumnByIndex(index);
      if (column == null) continue;

      const variable = VariablePathParser.parseString(column.name);
      if (!this.isResult(variable)) continue;

      const expected = tableRow.values[index];
      ScenarioRunner.validateRowValueResult(variable, expected, result, validationResult);
    }
  }

  private isResult(path: VariablePath) {
    if (this.functionNode?.results == null) return
    return any(this.functionNode.results.variables, result => result.name == path.parentIdentifier);
  }

  private static validateRowValueResult(path: VariablePath, value: ValidationTableValue, result: FunctionResult, validationResult: Array<string>) {

    let actual = result.getValue(path);
    let expectedValue = value.getValue();

    if (actual == null || expectedValue == null || !ScenarioRunner.compare(actual, expectedValue)) {
      validationResult.push(
        `'${path}' should be '${expectedValue ?? `<null>`}' (${expectedValue?.constructor.name}) but is '${actual ?? `<null>`}' (${actual?.constructor.name})`);
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

    if (failedMessages.length > 0 && !this.scenario.expectErrors?.hasValues) {
      this.fail(`Parsing errors: ${failedMessages.length}`, failedMessages);
      return false;
    }

    if (!this.scenario.expectErrors || !this.scenario.expectErrors.hasValues) {
      return true;
    }

    if (failedMessages.length == 0) {
      this.fail(`No errors but errors expected:`, this.scenario.expectErrors.messages);
      return false;
    }

    let errorNotFound = any(this.scenario.expectErrors.messages, message =>
      !any(failedMessages, failedMessage => failedMessage.includes(message)));

    if (errorNotFound) {
      this.fail(`Wrong error(s) occurred.`, StringArrayBuilder
        .new("Expected:").list(this.scenario.expectErrors.messages)
        .add("Actual:").list(failedMessages).array());
      return false;
    }

    this.context.success(this.scenario, null, null);
    return false;
  }

  private validateRootErrors(): boolean {
    const expected = this.scenario.expectRootErrors != null ? this.scenario.expectRootErrors?.messages : [];
    let failedMessages = this.parserLogger.errorMessages();
    if (!any(failedMessages)) {
      this.fail(`Root errors expected. No errors occurred.`, StringArrayBuilder
        .new("Expected:").list(expected)
        .array());
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
      this.context.success(this.scenario, null, null);
      return false; // don't compile and run rest of scenario
    }

    this.fail(`Wrong root error(s) occurred.`, StringArrayBuilder
      .new("Expected:").list(expected)
      .add("Actual:").list(this.parserLogger.errorMessages())
      .array());
    return false;
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
      this.fail(`Execution error not found`, StringArrayBuilder
        .new('Not found:').list(expected)
        .add('Actual:').add(errorMessage, 2)
        .array());
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

  private static compare(actual: any, expectedValue: any): boolean {
    if (expectedValue?.constructor == Date && actual?.constructor == Date) {
      return actual.toISOString() == expectedValue.toISOString();
    }
    return actual == expectedValue;
  }
}