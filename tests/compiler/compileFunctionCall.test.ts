import {compileFunction} from "./compileFunction";

describe('CompileFunctionCallTests', () => {
  it('LibraryFunctionPower', async () => {
    const script = await compileFunction(`function SimpleFunction
  parameters
    number Value
  results
    number Result
  Result = Math.Power(Value, 5)`);

    const result = script.run({"Value": 2});
    expect(result.number(`Result`)).toEqual(32);
   });

  it('NestedLibraryFunctionPower', async () => {
    const script = await compileFunction(`function SimpleFunction
  parameters
    string Value
  results
    number Result
  Result = Math.Power(Number.Parse(Value), 5)`);

    const result = script.run({"Value": "2"});
    expect(result.number(`Result`)).toEqual(32);
   });

  it('LexyFunctionCallSpreadResults', async () => {
    const script = await compileFunction(`
function Calling
  parameters
    number Value
  results
    number Result
    string Message
  Result = Value + 7
  Message = "Life is good" 

function Caller
  parameters
    number Value
  results
    number Result
  Calling.Parameters params
  params.Value = Value
  ... = Calling(params)`);

    const result = script.run({"Value": 2});
    expect(result.number(`Result`)).toEqual(9);
  });

  it('LexyFunctionCallSpreadParameters', async () => {
    const script = await compileFunction(`
function Calling
  parameters
    number Value
  results
    number Result
  Result = Value + 7 

function Caller
  parameters
    number Value
  results
    number Result
  Result = Calling(...)`);

    const result = script.run({"Value": 2});
    expect(result.number(`Result`)).toEqual(9);
  });

  it('LexyFunctionCallSpreadResultsAndParameters', async () => {
    const script = await compileFunction(`
function Calling
  parameters
    number Value
  results
    number Result
    string Message
  Result = Value + 7
  Message = "Life is good" 

function Caller
  parameters
    number Value
  results
    number Result
  ... = Calling(...)`);

    const result = script.run({"Value": 2});
    expect(result.number(`Result`)).toEqual(9);
  });
});
