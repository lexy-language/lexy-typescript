import {createRunner} from "./createRunner";

describe('RunIntroductionScenarios', () => {
  it('runAll', async() => {
    const runner = createRunner();
    runner.runAll(`tests/lexy-language/Introduction`);
  });
});