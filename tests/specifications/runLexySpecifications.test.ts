import {createRunner} from "./createRunner";

describe('RunLexySpecifications', () => {
  it('runAll', async() => {
    const runner = createRunner();
    await runner.runAll(`lexy-language/Specifications`);
  });
});
