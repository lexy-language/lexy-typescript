import {parseFunction} from "../parseFunctions";

describe('RunIntroductionScenarios', () => {
  it('testSimpleReturn', async () => {
    let script = await parseFunction(`function TestSimpleReturn
results
  number Result
Result = 777`);
    const result = script.run();
    expect(result.number(`Result`)).toEqual(777);
  });
});
