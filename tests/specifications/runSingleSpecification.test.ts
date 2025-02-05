import {createRunner} from "./createRunner";

describe('runSingleSpecification', () => {
  it('specificFile',  async() => {
    const runner = createRunner();
    runner.run(`tests/lexy-language/src/Specifications/Function/If.lexy`);
    //runner.run(`tests/lexy-language/src/specifications/Isolate.lexy`);

    //runner.run(`../laws/Specifications/ExecutionLogging/CallFunction.lexy`);
    //runner.run(`../laws/Specifications/Scenario/UnknownParameterType.lexy`);
  });
});