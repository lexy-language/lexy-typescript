import {compileFunction} from "./compileFunction";
import Decimal from "decimal.js";

describe('CompileFunctionTests', () => {
  it('testSimpleReturn', async () => {
     let script = compileFunction(`Function: TestSimpleReturn
  Results
    number Result
  Code
    Result = 777`);
     const result = script.run();
     expect(result.number(`Result`)).toEqual(777);
   });

  it('testParameterDefaultReturn', async () => {
     let script = compileFunction(`Function: TestSimpleReturn
  Parameters
    number Input = 5
  Results
    number Result
  Code
    Result = Input`);
     let result = script.run();
     expect(result.number(`Result`)).toEqual(5);
   });

  it('testAssignmentReturn', async () => {
     let script = compileFunction(`Function: TestSimpleReturn
  Parameters
    number Input = 5

  Results
    number Result
  Code
    Result = Input`);
     let result = script.run({
       Input: 777
     });
     expect(result.number(`Result`)).toEqual(777);
   });

  it('testMemberAccessAssignment', async () => {
     let script = compileFunction(`Table: ValidateTableKeyword
# Validate table keywords
  | number Value | number Result |
  | 0 | 0 |
  | 1 | 1 |

Function: ValidateTableKeywordFunction
# Validate table keywords
  Parameters
  Results
    number Result
  Code
    Result = ValidateTableKeyword.Count`);

     let result = script.run();
     expect(result.number(`Result`)).toEqual(2);
   });

  it('variableDeclarationInCode', async () => {
     let script = compileFunction(`Function: TestSimpleReturn
  Parameters
    number Value = 5 
  Results
    number Result
  Code
    number temp = 5
    temp = Value 
    Result = temp`);

     let result = script.run();
     expect(result.number(`Result`)).toEqual(5);
   });

  it('variableDeclarationWithDefaultInCode', async () => {
     let script = compileFunction(`Function: TestSimpleReturn
  Results
    number Result
  Code
    number temp = 5
    Result = temp
`);
     let result = script.run();
     expect(result.number(`Result`)).toEqual(5);
   });

  it('variableDeclarationWithDefaultEnumInCode', async () => {
    let script = compileFunction(`
Enum: SimpleEnum
  First
  Second
    
Function: TestEnum
  Results
    SimpleEnum Result
  Code
    Result = SimpleEnum.Second
`);
    let result = script.run();
    expect(result.string(`Result`)).toEqual("SimpleEnum.Second");
  });

  it('customType', async () => {
    let script = compileFunction(`
Type: SimpleComplex
  number First
  string Second
    
Function: TestCustomType
  Results
    SimpleComplex Result
  Code
    Result.First = 777
    Result.Second = "123"
`);
    let result = script.run();
    expect(result.object(`Result`)).toEqual({
      First: 777,
      Second: "123"
    });
  });

  it('CustomTypeNestedProperties', async () => {
    let script = compileFunction(`
Type: InnerComplex
  number First
  string Second
    
Type: SimpleComplex
  InnerComplex Inner
    
Function: TestCustomType
  Results
    SimpleComplex Result
  Code
    Result.Inner.First = 777
    Result.Inner.Second = "123"
`);
    let result = script.run();
    expect(result.object(`Result`)).toEqual({
      Inner: {
        First: 777,
        Second: "123"
      }
    });
  });
});
