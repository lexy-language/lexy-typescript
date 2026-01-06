import {compileFunction} from "./compileFunction";
import Decimal from "decimal.js";

describe('CompileFunctionTests', () => {
  it('testSimpleReturn', async () => {
     let script = compileFunction(`function TestSimpleReturn
  results
    number Result
  Result = 777`);
     const result = script.run();
     expect(result.number(`Result`)).toEqual(777);
   });

  it('testParameterDefaultReturn', async () => {
     let script = compileFunction(`function TestSimpleReturn
  parameters
    number Input = 5
  results
    number Result
  Result = Input`);
     let result = script.run();
     expect(result.number(`Result`)).toEqual(5);
   });

  it('testAssignmentReturn', async () => {
     let script = compileFunction(`function TestSimpleReturn
  parameters
    number Input = 5

  results
    number Result
  Result = Input`);
     let result = script.run({
       Input: 777
     });
     expect(result.number(`Result`)).toEqual(777);
   });

  it('testMemberAccessAssignment', async () => {
     let script = compileFunction(`table ValidateTableKeyword
// Validate table keywords
  | number Value | number Result |
  | 0 | 0 |
  | 1 | 1 |

function ValidateTableKeywordFunction
// Validate table keywords
  parameters
  results
    number Result
  Result = ValidateTableKeyword.Count`);

     let result = script.run();
     expect(result.number(`Result`)).toEqual(2);
   });

  it('variableDeclarationInCode', async () => {
     let script = compileFunction(`function TestSimpleReturn
  parameters
    number Value = 5 
  results
    number Result
  number temp = 5
  temp = Value 
  Result = temp`);

     let result = script.run();
     expect(result.number(`Result`)).toEqual(5);
   });

  it('variableDeclarationWithDefaultInCode', async () => {
     let script = compileFunction(`function TestSimpleReturn
  results
    number Result
  number temp = 5
  Result = temp`);

     let result = script.run();
     expect(result.number(`Result`)).toEqual(5);
   });

  it('variableDeclarationWithDefaultEnumInCode', async () => {
    let script = compileFunction(`
enum SimpleEnum
  First
  Second
    
function TestEnum
  results
    SimpleEnum Result
  Result = SimpleEnum.Second`);

    let result = script.run();
    expect(result.string(`Result`)).toEqual("SimpleEnum.Second");
  });

  it('declaredType', async () => {
    let script = compileFunction(`
type SimpleObject
  number First
  string Second
    
function TestDeclaredType
  results
    SimpleObject Result
  Result.First = 777
  Result.Second = "123"`);

    let result = script.run();
    expect(result.object(`Result`)).toEqual({
      First: 777,
      Second: "123"
    });
  });

  it('DeclaredTypeNestedProperties', async () => {
    let script = compileFunction(`
type InnerObject
  number First
  string Second
    
type SimpleObject
  InnerObject Inner
    
function TestDeclaredType
  results
    SimpleObject Result
  Result.Inner.First = 777
  Result.Inner.Second = "123"`);

    let result = script.run();
    expect(result.object(`Result`)).toEqual({
      Inner: {
        First: 777,
        Second: "123"
      }
    });
  });
});
