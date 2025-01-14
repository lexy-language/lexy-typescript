import {createRunner} from "./createRunner";

describe('RunLexySpecifications', () => {
  it('allSpecifications', async() => {
    const runner = createRunner();
    runner.runAll(`../laws/specifications`);
  });

  it('specificFile',  async()=> {
    const runner = createRunner();
    runner.run(`../laws/Specifications/BuiltInFunctions/Number.lexy`);
    //runner.run(`../laws/Specifications/Scenario/UnknownParameterType.lexy`);
  });
});