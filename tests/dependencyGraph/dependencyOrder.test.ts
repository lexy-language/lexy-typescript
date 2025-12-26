import buildDependencyGraph from "./buildDependencyGraph";

describe('DependencyOrder', () => {

  it('functionWithEnumAndTableDependency', async () => {
    const dependencies = buildDependencyGraph(
`function FunctionWithEnumDependency
  Parameters
    EnumExample EnumValue
  Results
    number Result
  Code
    Result = LOOKUP(TableExample, EnumExample.Single, TableExample.Example, TableExample.Value)

Table: TableExample
  | EnumExample Example | number Value |
  | EnumExample.Single  | 123          |

Enum: EnumExample
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
    const dependencies = buildDependencyGraph(
      `Scenario: ValidateBuiltOrder
  function
    Parameters
      TypeExample Example
    Results
      number Result
    Code
      FunctionWithFunctionDependency()
      FunctionWithFunctionTypeDependency()
  Parameters
    Example.EnumValue = EnumExample.Single
    Example.Nested.EnumValue = EnumExample.Married
  Results
    Result = 777

function FunctionWithFunctionDependency
  Parameters
    TypeExample Example
  Results
    number Result
  Code
    FunctionWithTypeDependency()
    FunctionWithTableDependency()
    FunctionWithEnumDependency()

function FunctionWithFunctionTypeDependency
  Parameters
    TypeExample Example
  Results
    number Result
  Code
    var functionParametersFill = fill(FunctionWithTypeDependency.Parameters)
    var functionParametersNew = new(FunctionWithTypeDependency.Parameters)
    var tableParameters = new(TableExample.Row)
    Result = 777

function FunctionWithTypeDependency
  Parameters
    TypeExample Example
  Results
    number Result
  Code
    Result = Example.Nested.Result

function FunctionWithTableDependency
  Parameters
    TypeExample Example
  Results
    number Result
  Code
    Result = LOOKUP(TableExample, EnumExample.Single, TableExample.Example, TableExample.Value)

function FunctionWithEnumDependency
  Parameters
    EnumExample EnumValue
    TypeExample Example
  Results
    number Result
  Code
    Result = 666

Type: NestedType
  EnumExample EnumValue
  number Result = 888

Type: TypeExample
  EnumExample EnumValue
  NestedType Nested

Table: TableExample
  | EnumExample Example | number Value |
  | EnumExample.Single  | 123          |

Enum: EnumExample
  Single
  Married
  CivilPartnership`, true);

    expect(dependencies.sortedNodes.length).toBe(11);
    expect(dependencies.sortedNodes[0].nodeName).toBe(`NestedType`);
    expect(dependencies.sortedNodes[1].nodeName).toBe(`EnumExample`);
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
