import {parseNodes} from "../parseFunctions";
import {firstOrDefault} from "../../src/infrastructure/arrayFunctions";
import {asFunction, instanceOfFunction} from "../../src/language/functions/function";
import {LexyCompiler} from "../../src/compiler/lexyCompiler";
import {ExecutableFunction} from "../../src/compiler/executableFunction";
import {LoggingConfiguration} from "../loggingConfiguration";
import {LibraryRuntime} from "../../src/runTime/libraries/libraryRuntime";
import {Libraries} from "../../src/functionLibraries/libraries";

export function compileFunction(code: string, librariesRuntimes: LibraryRuntime[] = []): ExecutableFunction {

  const libraries = new Libraries(librariesRuntimes)
  const {nodes, logger} = parseNodes(code, libraries);

  logger.assertNoErrors();

  const array = nodes.asArray();
  const functionNode = asFunction(firstOrDefault(array, value => instanceOfFunction(value)));
  if (functionNode == null) {
    throw new Error("No function found.")
  }

  const compiler = new LexyCompiler(LoggingConfiguration.getCompilerLogger(), LoggingConfiguration.getExecutionLogger(), libraries);
  const environment = compiler.compile(array);
  const executableFunction = environment.getFunction(functionNode);
  if (executableFunction == null) {
    throw new Error("No executableFunction found.")
  }
  return executableFunction;
}