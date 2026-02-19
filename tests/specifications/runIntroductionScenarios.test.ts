import {createRunner} from "./createRunner";

describe('RunIntroductionScenarios', () => {
  it('runAll', async() => {
    const runner = createRunner();
    await runner.runAll(`lexy-language/Introduction`);
  });
});
