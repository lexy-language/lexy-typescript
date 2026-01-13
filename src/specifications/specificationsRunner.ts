import type {ILogger} from "../infrastructure/logger";

import {ISpecificationRunnerContext, SpecificationRunnerContext} from "./specificationRunnerContext";
import {IFileSystem} from "../infrastructure/IFileSystem";
import {SpecificationFileRunner} from "./specificationFileRunner";
import {LexySourceDocument} from "../parser/lexySourceDocument";
import {ILexyParser} from "../parser/lexyParser";
import {ILexyCompiler} from "../generation/lexyCompiler";
import {format} from "../infrastructure/formatting";

export interface ISpecificationsRunner {
  run(folder: string): void;
  runAll(file: string): void;
}

export class SpecificationsRunner implements ISpecificationsRunner {

  private readonly parser: ILexyParser;
  private readonly compiler: ILexyCompiler;
  private readonly logger: ILogger;
  private readonly fileSystem: IFileSystem;

  constructor(logger: ILogger, fileSystem: IFileSystem, parser: ILexyParser, compiler: ILexyCompiler) {
    this.logger = logger;
    this.fileSystem = fileSystem;
    this.parser = parser;
    this.compiler = compiler;
  }

  public async run(file: string): Promise<void> {
    const context = new SpecificationRunnerContext(this.logger);
    await this.createFileRunner(context, file);
    SpecificationsRunner.runScenarios(context);
  }

  public async runAll(folder: string): Promise<void> {
    const context = new SpecificationRunnerContext(this.logger);
    await this.getRunners(context, folder);
    SpecificationsRunner.runScenarios(context);
  }

  private static runScenarios(context: ISpecificationRunnerContext): void {
    let runners = context.fileRunners;
    let countScenarios = context.countScenarios();
    context.logGlobal(`Specifications found: ${countScenarios}`);
    if (runners.length == 0) throw new Error(`No specifications found`);

    runners.forEach(runner => runner.run());

    context.logGlobal(`Specifications succeed: ${countScenarios - context.failed} / ${countScenarios}`);
    context.logTimeSpent();

    console.log(format(context.logEntries, 0));

    if (context.failed > 0) SpecificationsRunner.failed(context);
  }

  private static failed(context: ISpecificationRunnerContext): void {
    context.logGlobal(`--------------- FAILED PARSER LOGGING ---------------`);
    for (const runner of context.failedScenariosRunners()) {
      console.log(runner.parserLogging());
    }
    throw new Error(`Specifications failed: ${context.failed}\n${context.formatGlobalLog()}`);
  }

  private async getRunners(context: ISpecificationRunnerContext, folder: string): Promise<void> {
    let absoluteFolder = await this.getAbsoluteFolder(folder);

    context.logGlobal(`Specifications folder: ${absoluteFolder}`);

    await this.addFolder(context, absoluteFolder);
  }

  private async addFolder(context: ISpecificationRunnerContext, folder: string): Promise<void> {
    let files = await this.fileSystem.getDirectoryFiles(folder, [`.${LexySourceDocument.fileExtension}`, `.${LexySourceDocument.markdownExtension}`]);

    const sorted = files.sort();
    for (const file of sorted) {
      await this.createFileRunner(context, this.fileSystem.combine(folder, file))
    }

    const folders = await this.fileSystem.getDirectories(folder);
    for (const subFoder of folders) {
      await this.addFolder(context, this.fileSystem.combine(folder, subFoder));
    }
  }

  private async createFileRunner(context: ISpecificationRunnerContext, fileName: string): Promise<void> {
    let runner = new SpecificationFileRunner(fileName, this.compiler, this.parser, context);
    await runner.initialize();
    context.add(runner);
  }

  private async getAbsoluteFolder(folder: string): Promise<string> {
    let absoluteFolder = this.fileSystem.isPathRooted(folder)
      ? folder
      : this.fileSystem.getFullPath(folder);
    if (!await this.fileSystem.directoryExists(absoluteFolder)) {
      throw new Error(`Specifications folder doesn't exist: ${absoluteFolder}\n` + this.fileSystem.logFolders());
    }

    return absoluteFolder;
  }
}
