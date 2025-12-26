import {createRunner} from "./createRunner";

//this test can be used for debugging a single specifications file
describe('runSingleSpecification', () => {
  it('specificFile',  async() => {
    const runner = createRunner();
    runner.run(`tests/lexy-language/Specifications/Language/DuplicatedNames.lexy`);
    //runner.run(`tests/lexy-language/Specifications/Language/ArithmeticOperators.lexy`);
    //runner.run(`tests/lexy-language/src/specifications/Isolate.lexy`);

    //runner.run(`../laws/Specifications/ExecutionLogging/CallFunction.lexy`);
    //runner.run(`../laws/Specifications/Scenario/UnknownParameterType.lexy`);
  });
});