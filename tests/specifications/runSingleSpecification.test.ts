import {createRunner} from "./createRunner";

describe('runSingleSpecification', () => {
  it('specificFile',  async() => {
    const runner = createRunner();
    runner.run(`../laws/Specifications/Function/ComplexVariables.lexy`);
    //runner.run(`../laws/Specifications/ExecutionLogging/CallFunction.lexy`);
    //runner.run(`../laws/Specifications/Include/Include.lexy`);
    //runner.run(`../laws/Specifications/Scenario/UnknownParameterType.lexy`);
  });
});