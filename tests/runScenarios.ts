import type {IParserLogger} from "../src/parser/parserLogger";

import {NodeType} from "../src/language/nodeType";
import {ScenarioRunner} from "../src/specifications/scenarioRunner";
import {asScenario} from "../src/language/scenarios/scenario";
import {Assert, ILexyCompiler} from "../src";
import {SpecificationRunnerContext} from "../src/specifications/specificationRunnerContext";
import {SpecificationsLogEntry} from "../src/specifications/specificationsLogEntry";
import {ComponentNodeList} from "../src/language/componentNodeList";
import {Dependencies} from "../src/dependencyGraph/dependencies";
import {createCompiler} from "./compiler/compileFunction";
import {DummyLogger} from "./dummyLogger";
import {Libraries} from "../src/functionLibraries/libraries";

export function runScenarios(currentFileName: string, nodes: ComponentNodeList, parserLogger: IParserLogger, dependencies: Dependencies): readonly SpecificationsLogEntry[] {

  function runRunners(lexyCompiler: ILexyCompiler, context: SpecificationRunnerContext) {
    for (const node of nodes.values) {
      if (node.nodeType !== NodeType.Scenario) continue;
      const scenario = Assert.notNull(asScenario(node), "scenario");
      const runner = new ScenarioRunner(currentFileName, lexyCompiler, nodes, scenario, context, parserLogger, dependencies);
      runner.run()
    }
  }

  const libraries = new Libraries([])
  const lexyCompiler = createCompiler(libraries);
  const logger = new DummyLogger();
  const context = new SpecificationRunnerContext(logger)

  runRunners(lexyCompiler, context);

  context.logTimeSpent();

  return context.logEntries;
}
