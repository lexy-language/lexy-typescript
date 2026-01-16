import buildDependencyGraph from "./buildDependencyGraph";
import {Verify} from "../verify";

const nodeType = value => value.nodeType;

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

    Verify.model(dependencies, _ => _
      .countMapIs(model => model.nodes, 3)
      .containsKey(model => model.nodes, "TableExample", __ => __
        .areEqual(tableExample => tableExample.dependencies.size, 1)
        .containsKey(tableExample => tableExample.dependencies, "EnumExample")
        .areEqual(tableExample => tableExample.dependants.size, 1)
        .containsKey(tableExample => tableExample.dependants, "FunctionWithEnumDependency")
      )
      .containsKey(model => model.nodes, "EnumExample", __ => __
        .areEqual(enumExample => enumExample.dependencies.size, 0)
        .areEqual(enumExample => enumExample.dependants.size, 2)
        .containsKey(enumExample => enumExample.dependants, "TableExample")
        .containsKey(enumExample => enumExample.dependants, "FunctionWithEnumDependency")
      )
      .containsKey(model => model.nodes, "FunctionWithEnumDependency", __ => __
        .areEqual(functionWithEnumDependency => functionWithEnumDependency.dependencies.size, 2)
        .containsKey(functionWithEnumDependency => functionWithEnumDependency.dependencies, "TableExample")
        .containsKey(functionWithEnumDependency => functionWithEnumDependency.dependencies, "EnumExample")
        .areEqual(functionWithEnumDependency => functionWithEnumDependency.dependants.size, 0)
      )
      .countIs(model => model.sortedNodes, 3)
      .valuePropertyAtEquals(model => model.sortedNodes, 0, nodeType, "EnumExample")
      .valuePropertyAtEquals(model => model.sortedNodes, 1, nodeType, "TableExample")
      .valuePropertyAtEquals(model => model.sortedNodes, 2, nodeType, "FunctionWithEnumDependency")
      .countMapIs(model => model.circularReferences, 0)
    );
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

    Verify.model(dependencies, _ => _
      .countIs(model => model.sortedNodes, 11)
      .valuePropertyAtEquals(model => model.sortedNodes, 0, nodeType, "EnumExample")
      .valuePropertyAtEquals(model => model.sortedNodes, 1, nodeType, "NestedType")
      .valuePropertyAtEquals(model => model.sortedNodes, 2, nodeType, "TypeExample")
      .valuePropertyAtEquals(model => model.sortedNodes, 3, nodeType, "TableExample")
      .valuePropertyAtEquals(model => model.sortedNodes, 4, nodeType, "FunctionWithTypeDependency")
      .valuePropertyAtEquals(model => model.sortedNodes, 5, nodeType, "FunctionWithEnumDependency")
      .valuePropertyAtEquals(model => model.sortedNodes, 6, nodeType, "FunctionWithTableDependency")
      .valuePropertyAtEquals(model => model.sortedNodes, 7, nodeType, "FunctionWithFunctionTypeDependency")
      .valuePropertyAtEquals(model => model.sortedNodes, 8, nodeType, "FunctionWithFunctionDependency")
      .valuePropertyAtEquals(model => model.sortedNodes, 9, nodeType, "ValidateBuiltOrderFunction")
      .valuePropertyAtEquals(model => model.sortedNodes, 10, nodeType, "ValidateBuiltOrder")
      .countMapIs(model => model.circularReferences, 0)
    );
  });
});
