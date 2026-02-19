import {createRunner} from "./createRunner";

//this test can be used for debugging a single specifications file
describe('runSingleSpecification', () => {
  it('specificFile',  async() => {
    const runner = createRunner();
    await runner.run(`lexy-language/Specifications/Function/Code.lexy`);
  });
});
