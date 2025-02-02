import {createRunner} from "./createRunner";

describe('RunLexySpecifications', () => {
  it('allSpecifications', async() => {
    const runner = createRunner();
    runner.runAll(`tests/lexy-language/src/Specifications`);
  });
});