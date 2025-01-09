import {createRunner} from "./createRunner";

describe('RunLexySpecifications', () => {
  it('allSpecifications', async() => {
    const runner = createRunner();
    runner.runAll(`../laws/specifications`);
  });

  it('specificFile',  async()=> {
    const runner = createRunner();
    //runner.run(`../laws/Specifications/Function/Variables.lexy`);
    runner.run(`../laws/Specifications/Table/LookupRowByDate.lexy`);
  //runner.run(`../laws/Specifications/Function/Variables.lexy`);
  //runner.run(`../laws/Specifications/BuiltInFunctions/Date.lexy`);
  });
});
