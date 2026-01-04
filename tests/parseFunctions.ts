import {IParserLogger} from "../src/parser/parserLogger";

import {ComponentNodeList} from "../src/language/componentNodeList";
import {LexyParser} from "../src/parser/lexyParser";
import {Tokenizer} from "../src/parser/tokens/tokenizer";
import {ExpressionFactory} from "../src/language/expressions/expressionFactory";
import {asTable, Table} from "../src/language/tables/table";
import {asScenario, Scenario} from "../src/language/scenarios/scenario";
import {asEnumDefinition, EnumDefinition} from "../src/language/enums/enumDefinition";
import {ComponentNode} from "../src/language/componentNode";
import {asFunction, Function} from "../src/language/functions/function";
import {LoggingConfiguration} from "./loggingConfiguration";
import {NodeFileSystem} from "./nodeFileSystem";
import {ILibraries, Libraries} from "../src/functionLibraries/libraries";
import {LibraryRuntime} from "../src/runTime/libraries/libraryRuntime";

export function createParser(libraries: ILibraries) {

  const logger = LoggingConfiguration.getParserLogger();
  const expressionFactory = new ExpressionFactory();
  const fileSystem = new NodeFileSystem();
  const tokenizer = new Tokenizer();
  return new LexyParser(logger, tokenizer, fileSystem, expressionFactory, libraries);
}

export function parseNodes(code: string, libraries: ILibraries): { nodes: ComponentNodeList, logger: IParserLogger } {

  if (libraries == null) {
    libraries = new Libraries([]);
  }

  const parser = createParser(libraries);
  const codeLines = code.split("\n");
  const result = parser.parse(codeLines, `tests.lexy`, {suppressException: true});

  return {nodes: result.componentNodes, logger: result.logger};
}

export function parseFunction(code: string): { functionNode: Function, logger: IParserLogger } {
  const {result, logger} = parseNode<Function>(asFunction, code);
  return {functionNode: result, logger};
}

export function parseTable(code: string): { table: Table, logger: IParserLogger } {
  const {result, logger} = parseNode<Table>(asTable, code);
  return {table: result, logger};
}

export function parseScenario(code: string): { scenario: Scenario, logger: IParserLogger } {
  const {result, logger} = parseNode<Scenario>(asScenario, code);
  return {scenario: result, logger};
}

export function parseEnum(code: string): { enumDefinition: EnumDefinition, logger: IParserLogger } {
  const {result, logger} = parseNode<EnumDefinition>(asEnumDefinition, code);
  return {enumDefinition: result, logger};
}

export function parseNode<T extends ComponentNode>(castFunction: (value: object) => T | null, code: string):
  { result: T, logger: IParserLogger } {

  const {nodes, logger} = parseNodes(code);
  if (nodes.length != 1) throw new Error(`Only 1 node expected. Actual: ` + nodes.length);

  const first = nodes.first();
  const specificType = castFunction(first);
  if (specificType == null) {
    throw new Error(`Node not a ${castFunction.name}. Actual: ${first?.nodeType}`);
  }

  return {result: specificType, logger: logger};
}