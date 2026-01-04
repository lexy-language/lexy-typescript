import {LoggingConfiguration} from "../loggingConfiguration";
import {createParser} from "../parseFunctions";
import {LexyCompiler} from "../../src/compiler/lexyCompiler";
import {NodeFileSystem} from "../nodeFileSystem";
import {SpecificationsRunner} from "../../src/specifications/specificationsRunner";
import {Libraries} from "../../src/functionLibraries/libraries";

export function createRunner() {
  const mainLogger = LoggingConfiguration.getMainLogger();

  const libraries = new Libraries([])
  const parser = createParser(libraries);
  const compiler = new LexyCompiler(LoggingConfiguration.getCompilerLogger(), LoggingConfiguration.getExecutionLogger(), libraries);
  const nodeFileSystem = new NodeFileSystem();

  return new SpecificationsRunner(mainLogger, nodeFileSystem, parser, compiler);
}