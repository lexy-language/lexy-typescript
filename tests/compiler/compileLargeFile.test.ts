import {NodeFileSystem} from "../nodeFileSystem";
import {parseLines} from "../parseFunctions";
import {runScenarios} from "../runScenarios";

describe('CompileLargeFile', () => {
  it('parse compile and run 4000 scenarios', async () => {
    const fileSystem = new NodeFileSystem();
    const fullPath = fileSystem.combine(fileSystem.currentFolder(), "/compiler/1mb.lexy")
    const bigLexy = await fileSystem.readAllLines(fullPath)
    console.log("Lines: " + bigLexy.length);

    let result = await parseLines(bigLexy);
    expect(result.nodes.length).toBe(4000);

    let testResult = runScenarios("1mb.lexy", result.nodes, result.logger, result.dependencies)
    expect(testResult.filter(entry => entry.isError).length).toBe(0);
  });
});
