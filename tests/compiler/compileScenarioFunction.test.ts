import {compileFunction} from "./compileFunction";

describe('CompileScenarioFunction', () => {
  it('testSimpleReturn', async () => {
    let script = await compileFunction(`scenario NewScenario
  function
    parameters
      number Input
    results
      number Output
    Output = Input + 100
  parameters
    Input = 10
  results
    Output = 110`)

    let result = script.run({Input: 10})
    expect(result.number("Output")).toBe(110);
  });
});
