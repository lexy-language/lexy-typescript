import type {ILexyParser} from "../parser/lexyParser";
import type {IParserLogger} from "../parser/logging/parserLogger";
import type {ILexyCompiler} from "../generation/lexyCompiler";
import type {ISpecificationRunnerContext} from "./specificationRunnerContext";

import {IScenarioRunner, ScenarioRunner} from "./scenarioRunner";
import {firstOrDefault, sum} from "../infrastructure/arrayFunctions";
import {format} from "../infrastructure/formatting";
import {Scenario} from "../language/scenarios/scenario";
import {ComponentNodeList} from "../language/componentNodeList";
import {ParserResult} from "../parser/parserResult";
import {SourceReference} from "../language/sourceReference";
import {Dependencies} from "../dependencyGraph/dependencies";
import {Assert} from "../infrastructure/assert";
import {IFile} from "../infrastructure/file";

export interface ISpecificationFileRunner {
  scenarioRunners: ReadonlyArray<IScenarioRunner>;

  countScenarioRunners(): number;

  run(): void;
}

export class SpecificationFileRunner implements ISpecificationFileRunner {

  private readonly file: IFile;
  private readonly compiler: ILexyCompiler;
  private readonly parser: ILexyParser;
  private readonly runnerContext: ISpecificationRunnerContext;
  private readonly scenarioRunnersValue: Array<IScenarioRunner> = [];

  private result: ParserResult | null = null;

  public get scenarioRunners(): ReadonlyArray<IScenarioRunner> {
    return [...this.scenarioRunnersValue]
  }

  constructor(file: IFile, compiler: ILexyCompiler, parser: ILexyParser, runnerContext: ISpecificationRunnerContext) {
    this.file = file;
    this.compiler = compiler;
    this.parser = parser;
    this.runnerContext = runnerContext;
  }

  async initialize(): Promise<void> {

    let result = Assert.notNull(await this.parse(), "result");
    this.result = result;

    this.result
      .componentNodes
      .getScenarios()
      .forEach(scenario => {
        let scenarioRunner = this.createScenarioRunner(scenario, result.componentNodes, result.logger, result.dependencies);
        return this.scenarioRunnersValue.push(scenarioRunner);
      });
  }

  private async parse() {
    try {
      return await this.parser.parseFile(this.file, {suppressException: true});
    } catch (error: any) {
      throw new Error("Error while parsing " + this.file. name + "\n" + error.stack + "\n--------------------------------------\n")
    }
  }

  public run(): void {
    if (this.result == null) throw new Error("Runner not initialized")

    this.validateHasScenarioCheckingComponentErrors(this.result.rootNode.reference, this.result.logger);

    if (this.scenarioRunners.length == 0) return;

    this.runnerContext.logGlobal(`Filename: ${this.file.name}`);

    this.scenarioRunners.forEach(runner => this.runScenario(runner));
  }

  private runScenario(runner: IScenarioRunner) {
    try {
      runner.run()
    } catch (error) {
      throw new Error(`Error occurred while running: ${this.file.name}\n${error}`)
    }
  }

  private createScenarioRunner(scenario: Scenario, componentNodes: ComponentNodeList, parserLogger: IParserLogger, dependencies: Dependencies) {
    try {
      return new ScenarioRunner(this.file.name, this.compiler, componentNodes, scenario, this.runnerContext, parserLogger, dependencies);
    } catch (error: any) {
      throw new Error("Error occurred while create runner for: " + this.file.name + "\n" + error.stack);
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
        `${this.file.name} has component errors but no scenario that verifies expected component errors. Errors: ${componentErrors}`);
    }
  }
}
