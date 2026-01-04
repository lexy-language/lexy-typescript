import {compileFunction} from "./compileFunction";

describe('CompileFunctionCallTests', () => {
  it('LibraryFunctionPower', async () => {
    var script = compileFunction(`function SimpleFunction
  parameters
    number Value
  results
    number Result
  Result = Math.Power(Value, 5)`);

    const result = script.run({"Value": 2});
    expect(result.number(`Result`)).toEqual(32);
   });

  it('NestedLibraryFunctionPower', async () => {
    var script = compileFunction(`function SimpleFunction
  parameters
    string Value
  results
    number Result
  Result = Math.Power(Number.Parse(Value), 5)`);

    const result = script.run({"Value": "2"});
    expect(result.number(`Result`)).toEqual(32);
   });
});
