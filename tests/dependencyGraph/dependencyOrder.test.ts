import buildDependencyGraph from "./buildDependencyGraph";

describe('DependencyOrder', () => {

  it('functionWithEnumAndTableDependency', async () => {
    const dependencies = await buildDependencyGraph(
`function FunctionWithEnumDependency
  parameters
    EnumExample EnumValue
  results
    number Result
  Result = TableExample.LookUp(EnumExample.Single, TableExample.Example, TableExample.Value)

table TableExample
  | EnumExample Example | number Value |
  | EnumExample.Single  | 123          |

enum EnumExample
  Single
  Married
  CivilPartnership`, true);

    expect(dependencies.sortedNodes.length).toBe(3);
    expect(dependencies.sortedNodes[0].nodeName).toBe(`EnumExample`);
    expect(dependencies.sortedNodes[1].nodeName).toBe(`TableExample`);
    expect(dependencies.sortedNodes[2].nodeName).toBe(`FunctionWithEnumDependency`);
    expect(dependencies.circularReferences.length).toBe(0);
  });

  it('complexDependencyGraph', async () => {
    const dependencies = await buildDependencyGraph(
      `scenario ValidateBuiltOrder
  function
    parameters
      TypeExample Example
    results
      number Result
    ... = FunctionWithFunctionDependency(...)
    ... = FunctionWithFunctionTypeDependency(...)
  parameters
    Example.EnumValue = EnumExample.Single
    Example.Nested.EnumValue = EnumExample.Married
  results
    Result = 777

function FunctionWithFunctionDependency
  parameters
    TypeExample Example
  results
    number Result
  ... = FunctionWithTypeDependency(...)
  ... = FunctionWithTableDependency(...)
  ... = FunctionWithEnumDependency(...)

function FunctionWithFunctionTypeDependency
  parameters
    TypeExample Example
  results
    number Result
  var functionParametersFill = fill(FunctionWithTypeDependency.Parameters)
  var functionParametersNew = new(FunctionWithTypeDependency.Parameters)
  var tableParameters = new(TableExample.Row)
  Result = 777

function FunctionWithTypeDependency
  parameters
    TypeExample Example
  results
    number Result
  Result = Example.Nested.Result

function FunctionWithTableDependency
  parameters
    TypeExample Example
  results
    number Result
  Result = TableExample.LookUp(EnumExample.Single, TableExample.Example, TableExample.Value)

function FunctionWithEnumDependency
  parameters
    EnumExample EnumValue
    TypeExample Example
  results
    number Result
  Result = 666

type NestedType
  EnumExample EnumValue
  number Result = 888

type TypeExample
  EnumExample EnumValue
  NestedType Nested

table TableExample
  | EnumExample Example | number Value |
  | EnumExample.Single  | 123          |

enum EnumExample
  Single
  Married
  CivilPartnership`, true);

    expect(dependencies.sortedNodes.length).toBe(11);
    expect(dependencies.sortedNodes[0].nodeName).toBe(`EnumExample`);
    expect(dependencies.sortedNodes[1].nodeName).toBe(`NestedType`);
    expect(dependencies.sortedNodes[2].nodeName).toBe(`TypeExample`);
    expect(dependencies.sortedNodes[3].nodeName).toBe(`TableExample`);
    expect(dependencies.sortedNodes[4].nodeName).toBe(`FunctionWithTypeDependency`);
    expect(dependencies.sortedNodes[5].nodeName).toBe(`FunctionWithEnumDependency`);
    expect(dependencies.sortedNodes[6].nodeName).toBe(`FunctionWithTableDependency`);
    expect(dependencies.sortedNodes[7].nodeName).toBe(`FunctionWithFunctionTypeDependency`);
    expect(dependencies.sortedNodes[8].nodeName).toBe(`FunctionWithFunctionDependency`);
    expect(dependencies.sortedNodes[9].nodeName).toBe(`ValidateBuiltOrderFunction`);
    expect(dependencies.sortedNodes[10].nodeName).toBe(`ValidateBuiltOrder`);
    expect(dependencies.circularReferences.length).toBe(0);
  });
});
