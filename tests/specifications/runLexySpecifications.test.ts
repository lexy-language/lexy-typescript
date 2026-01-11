import {createRunner} from "./createRunner";

describe('RunLexySpecifications', () => {
  it('runAll', async() => {
    const runner = createRunner();
    await runner.runAll(`tests/lexy-language/Specifications`);
  });
});
