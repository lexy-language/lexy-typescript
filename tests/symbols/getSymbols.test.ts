import {SymbolKind} from "../../src/language/symbols/symbolKind";
import {getSymbols} from "./getSymbols";
import {NodesLogger} from "../../src/parser/logging/nodesLogger";
import {Verify} from "../verify";
import {VerifySymbols} from "./verifySymbols";
import {LoggingConfiguration} from "../loggingConfiguration";

describe('GetSymbolsTests', () => {

  //todo split in smaller tests, add spread mapping tests (I wasn't allowed)
  it('AllKeywords', async () => {
    let {symbols, nodes} = await getSymbols("test.lexy",
      `scenario TestSymbols                                                                               //  1
  function                                                                                         //  2
    parameters                                                                                     //  3
      TypeExample Example                                                                          //  4
    results                                                                                        //  5
      number Result                                                                                //  6
    ... = FunctionWithFunctionDependency(...)                                                      //  7
    ... = FunctionWithFunctionTypeDependency(...)                                                  //  8
  parameters                                                                                       //  9
    Example.EnumValue = EnumExample.Single                                                         // 10
    Example.Nested.EnumValue = EnumExample.Married                                                 // 11
  results                                                                                          // 12
    Result = 777                                                                                   // 13
                                                                                                   // 14
function FunctionWithFunctionDependency                                                            // 15
  parameters                                                                                       // 16
    TypeExample Example                                                                            // 17
  results                                                                                          // 18
    number Result                                                                                  // 19
  ... = FunctionWithTypeDependency(...)                                                            // 20
  ... = FunctionWithTableDependency(...)                                                           // 21
  ... = FunctionWithEnumDependency(...)                                                            // 22
                                                                                                   // 23
function FunctionWithFunctionTypeDependency                                                        // 24
  parameters                                                                                       // 25
    TypeExample Example                                                                            // 26
  results                                                                                          // 27
    number Result                                                                                  // 28
  var functionParametersFill = fill(FunctionWithTypeDependency.Parameters)                         // 29
  var functionParametersNew = new(FunctionWithTypeDependency.Parameters)                           // 30
  var tableParameters = new(TableExample.Row)                                                      // 31
  Result = 777                                                                                     // 32
                                                                                                   // 33
function FunctionWithTypeDependency                                                                // 34
  parameters                                                                                       // 35
    TypeExample Example                                                                            // 36
  results                                                                                          // 37
    number Result                                                                                  // 38
  Result = Example.Nested.Result                                                                   // 39
                                                                                                   // 40
function FunctionWithTableDependency                                                               // 41
  parameters                                                                                       // 42
    TypeExample Example                                                                            // 43
  results                                                                                          // 44
    number Result                                                                                  // 45
  Result = TableExample.LookUp(EnumExample.Single, TableExample.Example, TableExample.Value)       // 46
                                                                                                   // 47
function FunctionWithEnumDependency                                                                // 48
  parameters                                                                                       // 49
    EnumExample EnumValue                                                                          // 50
    TypeExample Example                                                                            // 51
  results                                                                                          // 52
    number Result                                                                                  // 53
  Result = 666                                                                                     // 54
                                                                                                   // 55
type NestedType                                                                                    // 56
  EnumExample EnumValue                                                                            // 57
  number Result = 888                                                                              // 58
                                                                                                   // 59
type TypeExample                                                                                   // 60
  EnumExample EnumValue                                                                            // 61
  NestedType Nested                                                                                // 62
                                                                                                   // 63
table TableExample                                                                                 // 64
  | EnumExample Example | number Value |                                                           // 65
  | EnumExample.Single  | 123          |                                                           // 66
                                                                                                   // 67
enum EnumExample                                                                                   // 68
  Single                                                                                           // 69
  Married                                                                                          // 70
  CivilPartnership                                                                                 // 71`);

    const mainLogger = LoggingConfiguration.getMainLogger();

    NodesLogger.log(nodes.values, value => mainLogger.logDebug(value));

    Verify.model(symbols, context => new VerifySymbols(context)
      .description(1, 1, "scenario: TestSymbols", SymbolKind.Scenario, "Test scenario")
      .description(1, 10, "scenario: TestSymbols", SymbolKind.Scenario)
      .verifyDescriptionNull(1, [21, 25, 100, 104])
      .verifyDescriptionNull(2, [1, 2])
      .description(2, 10, "function: TestSymbolsFunction", SymbolKind.Function)
      .description(3, 7, "parameters", SymbolKind.Keyword)
      .description(4, 8, "type: TypeExample", SymbolKind.Type)
      .description(4, 22, "parameter: TypeExample Example", SymbolKind.ParameterVariable)
      .description(5, 10, "results", SymbolKind.Keyword)
      .description(6, 8, "value type: number", SymbolKind.ValueType)
      .description(6, 16, "result: number Result", SymbolKind.ResultVariable)
      .description(7, 5, "spread operator", SymbolKind.Operator)
      .description(7, 6, "spread operator", SymbolKind.Operator)
      .description(7, 7, "spread operator", SymbolKind.Operator)
      .description(7, 11, "function: FunctionWithFunctionDependency", SymbolKind.Function)
      .description(7, 41, "function: FunctionWithFunctionDependency", SymbolKind.Function)
      .description(7, 42, "spread operator", SymbolKind.Operator) // todo add mapping
      .description(8, 6, "spread operator", SymbolKind.Operator) // todo add mapping
      .description(8, 14, "function: FunctionWithFunctionTypeDependency", SymbolKind.Function)
      .description(9, 5, "parameters", SymbolKind.Keyword)
      .description(10, 8, "parameter: EnumExample Example.EnumValue", SymbolKind.ParameterVariable)
      .description(10, 13, "parameter: EnumExample Example.EnumValue", SymbolKind.ParameterVariable)
      .description(10, 18, "parameter: EnumExample Example.EnumValue", SymbolKind.ParameterVariable)
      .description(10, 21, "parameter: EnumExample Example.EnumValue", SymbolKind.ParameterVariable)
      .description(10, 25, "enum member: EnumExample.Single", SymbolKind.EnumMember)
      .description(10, 35, "enum member: EnumExample.Single", SymbolKind.EnumMember)
      .description(10, 37, "enum member: EnumExample.Single", SymbolKind.EnumMember)
      .description(10, 42, "enum member: EnumExample.Single", SymbolKind.EnumMember)
      .description(11, 5, "parameter: EnumExample Example.Nested.EnumValue", SymbolKind.ParameterVariable)
      .description(11, 13, "parameter: EnumExample Example.Nested.EnumValue", SymbolKind.ParameterVariable)
      .description(11, 20, "parameter: EnumExample Example.Nested.EnumValue", SymbolKind.ParameterVariable)
      .description(11, 32, "enum member: EnumExample.Married", SymbolKind.EnumMember)
      .description(11, 44, "enum member: EnumExample.Married", SymbolKind.EnumMember)
      .description(12, 9, "results", SymbolKind.Keyword)
      .description(13, 8, "result: number Result", SymbolKind.ResultVariable)
      .description(13, 15, "777", SymbolKind.Constant)

      .description(15, 6, "function: FunctionWithFunctionDependency", SymbolKind.Function)
      .description(15, 21, "function: FunctionWithFunctionDependency", SymbolKind.Function)
      .description(16, 8, "parameters", SymbolKind.Keyword)
      .description(17, 8, "type: TypeExample", SymbolKind.Type)
      .description(17, 20, "parameter: TypeExample Example", SymbolKind.ParameterVariable)
      .description(18, 4, "results", SymbolKind.Keyword)
      .description(19, 8, "value type: number", SymbolKind.ValueType)
      .description(19, 16, "result: number Result", SymbolKind.ResultVariable)

      .description(20, 5, "spread operator", SymbolKind.Operator)
      .description(20, 22, "function: FunctionWithTypeDependency", SymbolKind.Function)
      .description(20, 37, "spread operator", SymbolKind.Operator) // todo add mapping

      .description(21, 5, "spread operator", SymbolKind.Operator)
      .description(21, 28, "function: FunctionWithTableDependency", SymbolKind.Function)
      .description(21, 38, "spread operator", SymbolKind.Operator) // todo add mapping

      .description(22, 3, "spread operator", SymbolKind.Operator)
      .description(22, 14, "function: FunctionWithEnumDependency", SymbolKind.Function)
      .description(22, 36, "spread operator", SymbolKind.Operator) // todo add mapping

      .description(24, 3, "function: FunctionWithFunctionTypeDependency", SymbolKind.Function)
      .description(24, 18, "function: FunctionWithFunctionTypeDependency", SymbolKind.Function)
      .description(25, 12, "parameters", SymbolKind.Keyword)
      .description(26, 11, "type: TypeExample", SymbolKind.Type)
      .description(26, 23, "parameter: TypeExample Example", SymbolKind.ParameterVariable)
      .description(27, 8, "results", SymbolKind.Keyword)
      .description(28, 7, "value type: number", SymbolKind.ValueType)
      .description(28, 14, "result: number Result", SymbolKind.ResultVariable)

      .description(29, 4, "type: FunctionWithTypeDependency.Parameters", SymbolKind.GeneratedType)
      .description(29, 17, "functionParametersFill", SymbolKind.Variable)
      .description(29, 34, "fill", SymbolKind.SystemFunction)
      .description(29, 53, "type: FunctionWithTypeDependency.Parameters", SymbolKind.GeneratedType)
      .description(29, 66, "type: FunctionWithTypeDependency.Parameters", SymbolKind.GeneratedType)

      .description(30, 5, "type: FunctionWithTypeDependency.Parameters", SymbolKind.GeneratedType)
      .description(30, 17, "functionParametersNew", SymbolKind.Variable)
      .description(30, 31, "new", SymbolKind.SystemFunction)
      .description(30, 44, "type: FunctionWithTypeDependency.Parameters", SymbolKind.GeneratedType)
      .description(30, 63, "type: FunctionWithTypeDependency.Parameters", SymbolKind.GeneratedType)

      .description(31, 5, "type: TableExample.Row", SymbolKind.GeneratedType)
      .description(31, 13, "tableParameters", SymbolKind.Variable)
      .description(31, 27, "new", SymbolKind.SystemFunction)
      .description(31, 30, "type: TableExample.Row", SymbolKind.GeneratedType)
      .description(31, 41, "type: TableExample.Row", SymbolKind.GeneratedType)

      .description(32, 7, "result: number Result", SymbolKind.ResultVariable)
      .description(32, 14, "777", SymbolKind.Constant)

      .description(34, 7, "function: FunctionWithTypeDependency", SymbolKind.Function)
      .description(34, 23, "function: FunctionWithTypeDependency", SymbolKind.Function)
      .description(35, 12, "parameters", SymbolKind.Keyword)
      .description(36, 11, "type: TypeExample", SymbolKind.Type)
      .description(36, 23, "parameter: TypeExample Example", SymbolKind.ParameterVariable)
      .description(37, 8, "results", SymbolKind.Keyword)
      .description(38, 7, "value type: number", SymbolKind.ValueType)
      .description(38, 14, "result: number Result", SymbolKind.ResultVariable)

      .description(41, 7, "function: FunctionWithTableDependency", SymbolKind.Function)
      .description(41, 28, "function: FunctionWithTableDependency", SymbolKind.Function)
      .description(42, 12, "parameters", SymbolKind.Keyword)
      .description(43, 15, "type: TypeExample", SymbolKind.Type)
      .description(43, 23, "parameter: TypeExample Example", SymbolKind.ParameterVariable)
      .description(44, 6, "results", SymbolKind.Keyword)

      .description(45, 8, "value type: number", SymbolKind.ValueType)
      .description(45, 15, "result: number Result", SymbolKind.ResultVariable)

      .description(46, 6, "result: number Result", SymbolKind.ResultVariable)
      .description(46, 27, "table function: TableExample.LookUp", SymbolKind.TableFunction)
      .description(46, 35, "enum member: EnumExample.Single", SymbolKind.EnumMember)
      .description(46, 46, "enum member: EnumExample.Single", SymbolKind.EnumMember)
      .description(46, 75, "type: TableExample.Value", SymbolKind.GeneratedType)
      .description(46, 88, "type: TableExample.Value", SymbolKind.GeneratedType)

      .description(48, 7, "function: FunctionWithEnumDependency", SymbolKind.Function)
      .description(48, 18, "function: FunctionWithEnumDependency", SymbolKind.Function)
      .description(49, 8, "parameters", SymbolKind.Keyword)
      .description(50, 15, "enum: EnumExample", SymbolKind.Enum)
      .description(50, 23, "parameter: EnumExample EnumValue", SymbolKind.ParameterVariable)
      .description(51, 13, "type: TypeExample", SymbolKind.Type)
      .description(51, 22, "parameter: TypeExample Example", SymbolKind.ParameterVariable)
      .description(52, 3, "results", SymbolKind.Keyword)
      .description(53, 5, "value type: number", SymbolKind.ValueType)
      .description(53, 16, "result: number Result", SymbolKind.ResultVariable)
      .description(54, 5, "result: number Result", SymbolKind.ResultVariable)
      .description(54, 14, "666", SymbolKind.Constant)

      .description(56, 3, "type: NestedType", SymbolKind.Type)
      .description(56, 14, "type: NestedType", SymbolKind.Type)
      .description(57, 18, "parameter: EnumExample EnumValue", SymbolKind.ParameterVariable)
      .description(58, 18, "parameter: number Result", SymbolKind.ParameterVariable)
      .description(58, 12, "parameter: number Result", SymbolKind.ParameterVariable)
      .description(58, 20, "888", SymbolKind.Constant)

      .description(60, 3, "type: TypeExample", SymbolKind.Type)
      .description(60, 15, "type: TypeExample", SymbolKind.Type)
      .description(61, 7, "enum: EnumExample", SymbolKind.Enum)
      .description(61, 18, "parameter: EnumExample EnumValue", SymbolKind.ParameterVariable)
      .description(62, 4, "type: NestedType", SymbolKind.Type)
      .description(62, 18, "parameter: NestedType Nested", SymbolKind.ParameterVariable)

      .description(64, 4, "table: TableExample", SymbolKind.Table)
      .description(64, 14, "table: TableExample", SymbolKind.Table)

      .description(65, 5, "enum: EnumExample", SymbolKind.Enum)
      .description(65, 21, "Example", SymbolKind.TableColumn)
      .description(65, 28, "value type: number", SymbolKind.ValueType)
      .description(65, 35, "Value", SymbolKind.TableColumn)

      .description(66, 12, "enum member: EnumExample.Single", SymbolKind.EnumMember)
      .description(66, 19, "enum member: EnumExample.Single", SymbolKind.EnumMember)
      .description(66, 28, "123", SymbolKind.Constant)

      .description(68, 2, "enum: EnumExample", SymbolKind.Enum)
      .description(68, 16, "enum: EnumExample", SymbolKind.Enum)
      .description(69, 7, "enum member: EnumExample.Single", SymbolKind.EnumMember)
      .description(70, 8, "enum member: EnumExample.Married", SymbolKind.EnumMember)
      .description(71, 15, "enum member: EnumExample.CivilPartnership", SymbolKind.EnumMember)
    );
  });
});
