import {parseNodes} from "../parseFunctions";

describe('ParseFunctionTests', () => {
  it('testDuplicatedFunctionName', async () => {
    const code = `function ValidateTableKeyword
  results
    number Result
  Result = 2

function ValidateTableKeyword
  results
    number Result
  Result = 1`;

    const {logger} = await parseNodes(code);
    expect(logger.hasErrorMessage(`Duplicated node name: 'ValidateTableKeyword'`))
      .toBe(true);
  });

  it('testWithFunctionDependencyAfterDependant', async () => {
    const code = `function Calling
  parameters
    number Value
  results
    number Result
    string Message
  Result = Value + 7

function Caller
  parameters
    number Value
  results
    number Result
  Calling.Parameters params
  params.Value = Value
  ... = Calling(params)`;

    const {logger} = await parseNodes(code);
    logger.assertNoErrors();
  });
});
