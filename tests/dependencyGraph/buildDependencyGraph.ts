import {DependencyGraphFactory} from "../../src/dependencyGraph/dependencyGraphFactory";
import {parseNodes} from "../parseFunctions";
import {Dependencies} from "../../src/dependencyGraph/dependencies";

export default async function buildDependencyGraph(code: string , throwException:boolean = true): Promise<Dependencies> {
  let {nodes, logger} = await parseNodes(code);
  if (throwException) logger.assertNoErrors();
  return DependencyGraphFactory.create(nodes);
}
