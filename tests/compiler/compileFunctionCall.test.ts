import {compileFunction} from "./compileFunction";

describe('CompileFunctionCallTests', () => {
  it('LibraryFunctionPower', async () => {
    const script = compileFunction(`function SimpleFunction
  parameters
    number Value
  results
    number Result
  Result = Math.Power(Value, 5)`);

    const result = script.run({"Value": 2});
    expect(result.number(`Result`)).toEqual(32);
   });

  it('NestedLibraryFunctionPower', async () => {
    const script = compileFunction(`function SimpleFunction
  parameters
    string Value
  results
    number Result
  Result = Math.Power(Number.Parse(Value), 5)`);

    const result = script.run({"Value": "2"});
    expect(result.number(`Result`)).toEqual(32);
   });

  it('LexyFunctionCallSpreadResults', async () => {
    const script = compileFunction(`
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
  Calling.Parameters params
  params.Value = Value
  ... = Calling(params)`);

    const result = script.run({"Value": 2});
    expect(result.number(`Result`)).toEqual(9);
  });

  it('LexyFunctionCallSpreadParameters', async () => {
    const script = compileFunction(`
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
  var result = Calling(...)
  Result = result.Result`);

    const result = script.run({"Value": 2});
    expect(result.number(`Result`)).toEqual(9);
  });

  it('LexyFunctionCallSpreadResultsAndParameters', async () => {
    const script = compileFunction(`
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
  ... = Calling(...)`);


    "let result = __environment.function__Calling.__inline(function() {var __result = new __environment.function__Calling.__Parameters();__result.Value = __parameters.Value;return __result; }()__context);"

    const result = script.run({"Value": 2});
    expect(result.number(`Result`)).toEqual(9);
  });
});
