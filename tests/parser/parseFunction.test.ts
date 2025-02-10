import {parseNodes} from "../parseFunctions";

describe('ParseFunctionTests', () => {
  it('testDuplicatedFunctionName', async () => {
    const code = `Function: ValidateTableKeyword
  Results
    number Result
  Code
    Result = 2

Function: ValidateTableKeyword
  Results
    number Result
  Code
    Result = 1`;

    const {logger} = parseNodes(code);
    expect(logger.hasErrorMessage(`Duplicated node name: 'ValidateTableKeyword'`))
      .toBe(true);
  });
});
