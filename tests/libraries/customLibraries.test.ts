import {compileFunction} from "../compiler/compileFunction";
import {LibraryRuntime, Types} from "../../src/runTime/libraries/libraryRuntime";
import {Libraries} from "../../src/functionLibraries/libraries";

const CustomLibrary: LibraryRuntime = {
  name: "CustomLibrary",
  functions: {
    FunctionString: function FunctionString(value: string): string {
      return `a${value}c`;
    },
  },
  functionsInfo: {
    FunctionString: {
      returnType: Types.String,
      args: [Types.String]
    }
  }
};

describe('CustomLibrariesTests', () => {
  it('LibraryFunctionString', async () => {

    let script = await compileFunction(`function SimpleFunction
  results
    string Result
  Result = CustomLibrary.FunctionString("b")`, new Libraries([CustomLibrary]));

    const result = script.run();
    expect(result.string(`Result`)).toEqual("abc");
  });
});
