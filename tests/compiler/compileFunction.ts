import {parseNodes} from "../parseFunctions";
import {firstOrDefault} from "../../src/infrastructure/arrayFunctions";
import {asFunction, instanceOfFunction} from "../../src/language/functions/function";
import {LexyCompiler} from "../../src";
import {ExecutableFunction} from "../../src/generation/executableFunction";
import {LoggingConfiguration} from "../loggingConfiguration";
import {Libraries} from "../../src/functionLibraries/libraries";

export function createCompiler(libraries: Libraries) {
  return new LexyCompiler(LoggingConfiguration.getCompilerLogger(), LoggingConfiguration.getExecutionLogger(), libraries);
}

export async function compileFunction(code: string, libraries: Libraries = null): Promise<ExecutableFunction> {

  if (libraries == null) {
    libraries = new Libraries([]);
  }

  const {nodes, logger} = await parseNodes(code, libraries);

  logger.assertNoErrors();

  const array = nodes.values;
  const functionNode = asFunction(firstOrDefault(array, value => instanceOfFunction(value)));
  if (functionNode == null) {
    throw new Error("No function found.")
  }
  const compiler = createCompiler(libraries);
  const environment = compiler.compile(array);
  const executableFunction = environment.getFunction(functionNode);
  if (executableFunction == null) {
    throw new Error("No executableFunction found.")
  }
  return executableFunction;
}
