import {IParserLogger} from "../src/parser/logging/parserLogger";

import {ComponentNodeList} from "../src/language/componentNodeList";
import {LexyParser} from "../src";
import {Tokenizer} from "../src/parser/tokens/tokenizer";
import {ExpressionFactory} from "../src/language/expressions/expressionFactory";
import {asTable, Table} from "../src/language/tables/table";
import {asScenario, Scenario} from "../src/language/scenarios/scenario";
import {asEnumDefinition, EnumDefinition} from "../src/language/enums/enumDefinition";
import {ComponentNode} from "../src/language/componentNode";
import {asFunction, Function} from "../src/language/functions/function";
import {NodeFileSystem} from "./nodeFileSystem";
import {ILibraries, Libraries} from "../src/functionLibraries/libraries";
import {Dependencies} from "../src/dependencyGraph/dependencies";
import {firstOrDefault} from "../src/infrastructure/arrayFunctions";
import {LoggingConfiguration} from "./loggingConfiguration";

export function createParser(libraries: ILibraries | null = null) {

  if (libraries == null) {
    libraries = new Libraries([]);
  }

  const logger = LoggingConfiguration.getParserLogger();
  const expressionFactory = new ExpressionFactory();
  const fileSystem = new NodeFileSystem();
  const tokenizer = new Tokenizer();

  return new LexyParser(logger, tokenizer, fileSystem, expressionFactory, libraries);
}

export async function parseFile(fileName: string, libraries: ILibraries | null = null): Promise<{nodes: ComponentNodeList, logger: IParserLogger, dependencies: Dependencies}> {

  const parser = createParser(libraries);
  const result = await parser.parseFile(fileName, {suppressException: true});

  return {nodes: result.componentNodes, logger: result.logger, dependencies: result.dependencies};
}

export async function parseLines(lines: string[], libraries: ILibraries | null = null): Promise<{nodes: ComponentNodeList, logger: IParserLogger, dependencies: Dependencies}> {

  const parser = createParser(libraries);
  const result = await parser.parseCode(`tests.lexy`, lines, {suppressException: true});

  return {nodes: result.componentNodes, logger: result.logger, dependencies: result.dependencies};
}

export async function parseNodes(code: string, libraries: ILibraries | null = null): Promise<{nodes: ComponentNodeList, logger: IParserLogger}> {
  const lines = code.split("\n");
  return await parseLines(lines, libraries);
}

export async function parseFunction(code: string): Promise<{functionNode: Function, logger: IParserLogger}> {
  const {result, logger} = await parseNode<Function>(asFunction, code);
  return {functionNode: result, logger};
}

export async function parseTable(code: string): Promise<{ table: Table, logger: IParserLogger}> {
  const {result, logger} = await parseNode<Table>(asTable, code);
  return {table: result, logger};
}

export async function parseScenario(code: string): Promise<{scenario: Scenario, logger: IParserLogger}> {
  const {result, logger} = await parseNode<Scenario>(asScenario, code);
  return {scenario: result, logger};
}

export async function parseEnum(code: string): Promise<{enumDefinition: EnumDefinition, logger: IParserLogger}> {
  const {result, logger} = await parseNode<EnumDefinition>(asEnumDefinition, code);
  return {enumDefinition: result, logger};
}

export async function parseNode<T extends ComponentNode>(castFunction: (value: object) => T | null, code: string):
  Promise<{ result: T, logger: IParserLogger }> {

  const {nodes, logger} = await parseNodes(code);
  if (nodes.length != 1) throw new Error(`Only 1 node expected. Actual: ` + nodes.length);

  const first = firstOrDefault(nodes.values);
  const specificType = castFunction(first);
  if (specificType == null) {
    throw new Error(`Node not a ${castFunction.name}. Actual: ${first?.nodeType}`);
  }

  return {result: specificType, logger: logger};
}
