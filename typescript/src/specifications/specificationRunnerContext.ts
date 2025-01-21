import type {ISpecificationFileRunner} from "./specificationFileRunner";
import type {IScenarioRunner} from "./scenarioRunner";
import type {ILogger} from "../infrastructure/logger";

import {Scenario} from "../language/scenarios/scenario";
import {format} from "../infrastructure/formatting";
import {BuiltInDateFunctions} from "../runTime/builtInDateFunctions";
import {IRootNode} from "../language/rootNode";
import {SourceReference} from "../parser/sourceReference";

export interface ISpecificationRunnerContext {
  failed: number;
  fileRunners: ReadonlyArray<ISpecificationFileRunner>;
  logEntries: ReadonlyArray<SpecificationsLogEntry>;

  fail(scenario: Scenario, message: string, errors: Array<string> | null): void;
  success(scenario: Scenario): void;

  logGlobal(message: string): void;
  logTimeSpent(): void;

  add(fileRunner: ISpecificationFileRunner): void;

  failedScenariosRunners(): ReadonlyArray<IScenarioRunner>;
  countScenarios(): number;

  formatGlobalLog(): string;
}

export class SpecificationsLogEntry {
  public readonly node: IRootNode | null;
  public readonly reference: SourceReference | null;
  public readonly isError: boolean;
  public readonly message: string;
  public readonly errors: Array<string> | null;

  constructor(reference: SourceReference | null, node: IRootNode | null, isError: boolean, message: string, errors: Array<string> | null = null) {
    this.reference = reference;
    this.node = node;
    this.isError = isError;
    this.message = message;
    this.errors = errors;
  }

  public toString(): string {
    return this.errors == null
      ? this.message
      : this.message + '\n' + this.errors?.join("\n");
  }
}

export class SpecificationRunnerContext implements ISpecificationRunnerContext {

  private readonly fileRunnersValue: Array<ISpecificationFileRunner> = [];
  private readonly logger: ILogger;
  private readonly startTimestamp: Date;

  private globalLog: Array<SpecificationsLogEntry> = [];
  private failedValues = 0;

  public get logEntries(): ReadonlyArray<SpecificationsLogEntry> {
    return this.globalLog;
  }

  constructor(logger: ILogger) {
    this.startTimestamp = new Date();
    this.logger = logger;
  }

  public get failed(): number {
    return this.failedValues;
  }

  public get fileRunners() {
    return this.fileRunnersValue;
  }

  public fail(scenario: Scenario, message: string, errors: Array<string> | null): void {
    this.failedValues++;

    const entry = new SpecificationsLogEntry(scenario.reference, scenario, true, `FAILED - ${scenario.name}: ${message}`, errors);
    this.globalLog.push(entry)
    this.logger.logError(`- FAILED - ${scenario.name}: ${message}`);
    if (errors != null) {
      errors.forEach(message => this.logger.logInformation(`  ${message}`));
    }
  }

  public logGlobal(message: string): void {
    const entry = new SpecificationsLogEntry(null, null, false, message);
    this.globalLog.push(entry)
    this.logger.logInformation(message);
  }

  public logTimeSpent(): void {

    const difference = BuiltInDateFunctions.milliseconds(new Date(), this.startTimestamp);
    const message = `Time: ${difference} milliseconds`;

    const entry = new SpecificationsLogEntry(null, null, false, message);
    this.globalLog.push(entry)
    this.logger.logInformation(message);
  }

  public success(scenario: Scenario): void {
    const entry = new SpecificationsLogEntry(scenario.reference, scenario, false, `SUCCESS - ${scenario.name}`);
    this.globalLog.push(entry);
    this.logger.logInformation(`- SUCCESS - ${scenario.name}`);
  }

  public add(fileRunner: ISpecificationFileRunner): void {
    this.fileRunners.push(fileRunner);
  }

  public failedScenariosRunners(): Array<IScenarioRunner> {
    const result: Array<IScenarioRunner> = [];
    this.fileRunners.forEach(runner =>
      runner.scenarioRunners.forEach(scenario => {
        if (scenario.failed) result.push(scenario)
      }));
    return result;
  }

  public countScenarios(): number {
    let total = 0;
    this.fileRunners.map(fileRunner => total += fileRunner.countScenarioRunners());
    return total;
  }

  public formatGlobalLog(): string {
    return format(this.globalLog, 2);
  }
}
