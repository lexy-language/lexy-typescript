import type {ILogger} from "../infrastructure/logger";

import {ISpecificationRunnerContext, SpecificationRunnerContext} from "./specificationRunnerContext";
import {IFileSystem} from "../infrastructure/IFileSystem";
import {SpecificationFileRunner} from "./specificationFileRunner";
import {LexySourceDocument} from "../parser/lexySourceDocument";
import {ILexyParser} from "../parser/lexyParser";
import {ILexyCompiler} from "../generation/lexyCompiler";
import {format} from "../infrastructure/formatting";
import {IProject, Project} from "../infrastructure/project";
import {IFile} from "../infrastructure/file";

export interface ISpecificationsRunner {
  run(folder: string): void;
  runAll(file: string): void;
}

export class SpecificationsRunner implements ISpecificationsRunner {

  private static readonly extensions = [`.${LexySourceDocument.fileExtension}`, `.${LexySourceDocument.markdownExtension}`];

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
    const project = new Project(this.fileSystem);

    await this.createFileRunner(project.file(file), context);
    SpecificationsRunner.runScenarios(context);
  }

  public async runAll(folder: string): Promise<void> {
    const context = new SpecificationRunnerContext(this.logger);
    const project = new Project(this.fileSystem, folder);
    await this.getRunners(project, context);
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

  private async getRunners(project: IProject, context: ISpecificationRunnerContext): Promise<void> {

    context.logGlobal(`Specifications base folder: ${project.baseFolder}`);

    await this.addFolder(project, "", context);
  }

  private async addFolder(project: IProject, folder: string, context: ISpecificationRunnerContext): Promise<void> {

    const fullPath = this.fileSystem.combine(project.baseFolder, folder);
    const files = await this.fileSystem.getDirectoryFiles(fullPath, SpecificationsRunner.extensions);
    const folders = await this.fileSystem.getDirectories(fullPath);

    context.logGlobal(`Specifications folder: ${folder} (Files: ${files.length} Folders: ${folders.length})`);

    const sorted = files.sort();
    for (const file of sorted) {
      const filePath = this.fileSystem.combine(folder, file);
      await this.createFileRunner(project.file(filePath), context)
    }

    for (const subFolder of folders) {
      let fullFolder = this.fileSystem.combine(folder, subFolder);
      await this.addFolder(project, fullFolder, context);
    }
  }

  private async createFileRunner(file: IFile, context: ISpecificationRunnerContext): Promise<void> {
    let runner = new SpecificationFileRunner(file, this.compiler, this.parser, context);
    await runner.initialize();
    context.add(runner);
  }

  private async getAbsoluteFolder(project: IProject): Promise<string> {
    let absoluteFolder = this.fileSystem.isPathRooted(project.baseFolder)
      ? project.baseFolder
      : this.fileSystem.getFullPath(project.baseFolder);

    if (!await this.fileSystem.directoryExists(absoluteFolder)) {
      throw new Error(`Specifications folder doesn't exist: ${absoluteFolder}\n` + this.fileSystem.logFolders());
    }

    return absoluteFolder;
  }
}
