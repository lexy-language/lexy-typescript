import type {ISpecificationFileRunner} from "./specificationFileRunner";
import type {IScenarioRunner} from "./scenarioRunner";
import type {ILogger} from "../infrastructure/logger";

import {Scenario} from "../language/scenarios/scenario";
import {format} from "../infrastructure/formatting";
import {milliseconds} from "../runTime/libraries/dateLibrary";
import {ExecutionLogEntry} from "../runTime/executionLogEntry";
import {SpecificationsLogEntry} from "./specificationsLogEntry";

export interface ISpecificationRunnerContext {
  failed: number;
  fileRunners: ReadonlyArray<ISpecificationFileRunner>;
  logEntries: ReadonlyArray<SpecificationsLogEntry>;

  fail(scenario: Scenario, message: string, errors: ReadonlyArray<string> | null, index: number | null | undefined): void;

  success(scenario: Scenario, logging: ReadonlyArray<ExecutionLogEntry> | null, index: number | null | undefined): void;

  logGlobal(message: string): void;
  logTimeSpent(): void;

  add(fileRunner: ISpecificationFileRunner): void;

  failedScenariosRunners(): ReadonlyArray<IScenarioRunner>;
  countScenarios(): number;

  formatGlobalLog(): string;
}

export class SpecificationRunnerContext implements ISpecificationRunnerContext {

  private readonly fileRunnersValue: Array<ISpecificationFileRunner> = [];
  private readonly logger: ILogger;
  private readonly startTimestamp: Date;

  private logEntriesValue: Array<SpecificationsLogEntry> = [];
  private failedValues = 0;

  public get logEntries(): ReadonlyArray<SpecificationsLogEntry> {
    return this.logEntriesValue;
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

  public fail(scenario: Scenario, message: string, errors: Array<string> | null, index: number | null | undefined): void {
    this.failedValues++;

    const suffix = index != null ? `[${index}]` : ''

    const entry = new SpecificationsLogEntry(scenario.reference, scenario, true, `FAILED - ${scenario.name}${suffix}: ${message}`, errors);
    this.logEntriesValue.push(entry)
    this.logger.logError(`- FAILED - ${scenario.name}${suffix}: ${message}`);
    if (errors != null) {
      errors.forEach(message => this.logger.logInformation(`  ${message}`));
    }
  }

  public logGlobal(message: string): void {
    const entry = new SpecificationsLogEntry(null, null, false, message);
    this.logEntriesValue.push(entry)
    this.logger.logInformation(message);
  }

  public logTimeSpent(): void {

    const difference = milliseconds(new Date(), this.startTimestamp);
    const message = `Time: ${difference} milliseconds`;

    const entry = new SpecificationsLogEntry(null, null, false, message);
    this.logEntriesValue.push(entry)
    this.logger.logInformation(message);
  }

  public success(scenario: Scenario, logging: ReadonlyArray<ExecutionLogEntry> | null = null, index: number | null | undefined): void {
    const suffix = index != null ? `[${index}]` : ''
    const entry = new SpecificationsLogEntry(scenario.reference, scenario, false, `SUCCESS - ${scenario.name}${suffix}`, null, logging);
    this.logEntriesValue.push(entry);
    this.logger.logInformation(`- SUCCESS - ${scenario.name}${suffix}`);
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
    return format(this.logEntriesValue, 2);
  }
}
