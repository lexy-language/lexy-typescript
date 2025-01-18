import {createRunner} from "./createRunner";

describe('runSingleSpecification', () => {
  it('specificFile',  async()=> {
    const runner = createRunner();
    runner.run(`../laws/Specifications/Language/DateTime.lexy`);
    //runner.run(`../laws/Specifications/Isolate.lexy`);
    //runner.run(`../laws/Specifications/Scenario/UnknownParameterType.lexy`);
  });
});