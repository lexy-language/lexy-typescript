import type {ILexyParser} from "../parser/lexyParser";
import type {IParserLogger} from "../parser/parserLogger";
import type {ILexyCompiler} from "../generation/lexyCompiler";
import type {ISpecificationRunnerContext} from "./specificationRunnerContext";

import {IScenarioRunner, ScenarioRunner} from "./scenarioRunner";
import {firstOrDefault, sum} from "../infrastructure/arrayFunctions";
import {format} from "../infrastructure/formatting";
import {Scenario} from "../language/scenarios/scenario";
import {ComponentNodeList} from "../language/componentNodeList";
import {ParserResult} from "../parser/parserResult";
import {SourceReference} from "../parser/sourceReference";

export interface ISpecificationFileRunner {
  scenarioRunners: ReadonlyArray<IScenarioRunner>;

  countScenarioRunners(): number;

  run(): void;
}

export class SpecificationFileRunner implements ISpecificationFileRunner {

  private readonly compiler: ILexyCompiler;
  private readonly parser: ILexyParser;
  private readonly fileName: string;
  private readonly runnerContext: ISpecificationRunnerContext;
  private readonly scenarioRunnersValue: Array<IScenarioRunner> = [];

  private result: ParserResult | null = null;

  public get scenarioRunners(): ReadonlyArray<IScenarioRunner> {
    return [...this.scenarioRunnersValue]
  }

  constructor(fileName: string, compiler: ILexyCompiler, parser: ILexyParser, runnerContext: ISpecificationRunnerContext) {
    this.fileName = fileName;
    this.compiler = compiler;
    this.parser = parser;
    this.runnerContext = runnerContext;
  }

  async initialize(): Promise<void> {
    let result: ParserResult;
    try {
      result = await this.parser.parseFile(this.fileName, {suppressException: true});
    } catch (error: any) {
      throw new Error("Error while parsing " + this.fileName + "\n" + error.stack + "\n--------------------------------------\n")
    }
    this.result = result
    result
      .componentNodes
      .getScenarios()
      .forEach(scenario =>
        this.scenarioRunnersValue.push(this.getScenarioRunner(scenario, result.componentNodes, result.logger)));
  }

  public run(): void {
    if (this.result == null) throw new Error("Runner not initialized")

    this.validateHasScenarioCheckingComponentErrors(this.result.rootNode.reference, this.result.logger);

    if (this.scenarioRunners.length == 0) return;

    this.runnerContext.logGlobal(`Filename: ${this.fileName}`);

    this.scenarioRunners.forEach(runner => this.runScenario(runner));
  }

  private runScenario(runner: IScenarioRunner) {
    try {
      runner.run()
    } catch (error) {
      throw new Error(`Error occurred while running: ${this.fileName}\n${error}`)
    }
  }

  private getScenarioRunner(scenario: Scenario, componentNodes: ComponentNodeList, parserLogger: IParserLogger) {
    try {
      return new ScenarioRunner(this.fileName, this.compiler, componentNodes, scenario, this.runnerContext, parserLogger);
    } catch (error: any) {
      throw new Error("Error occurred while create runner for: " + this.fileName + "\n" + error.stack);
    }
  }

  public countScenarioRunners(): number {
    return sum(this.scenarioRunners, runner => runner.countScenarios());
  }

  private validateHasScenarioCheckingComponentErrors(reference: SourceReference, logger: IParserLogger): void {
    if (!logger.hasComponentErrors()) return;

    let componentScenarioRunner =
      firstOrDefault(this.scenarioRunners, runner => runner.scenario.expectComponentErrors?.hasValues == true);

    if (componentScenarioRunner == null) {
      const componentErrors = format(logger.errorComponentMessages(), 2);
      logger.fail(
        reference,
        `${this.fileName} has component errors but no scenario that verifies expected component errors. Errors: ${componentErrors}`);
    }
  }
}
