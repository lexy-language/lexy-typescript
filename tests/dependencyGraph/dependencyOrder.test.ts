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

    Verify.model(_ => _
      .countMapIs(dependencies.nodes, 3, "nodes")
      .containsKey(dependencies.nodes, "TableExample", "nodes", (tableExample, __) => __
        .areEqual(tableExample.dependencies.size, 1, "tableExample.dependencies")
        .containsKey(tableExample.dependencies, "EnumExample", "tableExample.dependencies")
        .areEqual(tableExample.dependants.size, 1, "tableExample.dependants")
        .containsKey(tableExample.dependants, "FunctionWithEnumDependency", "tableExample.dependants")
      )
      .containsKey(dependencies.nodes, "EnumExample", "nodes",(enumExample, __) => __
        .areEqual(enumExample.dependencies.size, 0, "enumExample.dependencies")
        .areEqual(enumExample.dependants.size, 2, "enumExample.dependants")
        .containsKey(enumExample.dependants, "TableExample", "enumExample.dependants")
        .containsKey(enumExample.dependants, "FunctionWithEnumDependency", "enumExample.dependants")
      )
      .containsKey(dependencies.nodes, "FunctionWithEnumDependency", "nodes", (functionWithEnumDependency, __) => __
        .areEqual(functionWithEnumDependency.dependencies.size, 2, "functionWithEnumDependency")
        .containsKey(functionWithEnumDependency.dependencies, "TableExample", "functionWithEnumDependency")
        .containsKey(functionWithEnumDependency.dependencies, "EnumExample", "functionWithEnumDependency")
        .areEqual(functionWithEnumDependency.dependants.size, 0, "functionWithEnumDependency")
      )
      .countIs(dependencies.sortedNodes, 3, "sortedNodes")
      .valuePropertytAtEquals(dependencies.sortedNodes, 0, nodeType, "EnumExample", "sortedNodes")
      .valuePropertytAtEquals(dependencies.sortedNodes, 1, nodeType, "TableExample", "sortedNodes")
      .valuePropertytAtEquals(dependencies.sortedNodes, 2, nodeType, "FunctionWithEnumDependency", "sortedNodes")
      .countMapIs(dependencies.circularReferences, 0, "circularReferences")
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

    Verify.model(_ => _
      .countIs(dependencies.sortedNodes, 11, "sortedNodes")
      .valuePropertytAtEquals(dependencies.sortedNodes, 0, nodeType, "EnumExample", "sortedNodes")
      .valuePropertytAtEquals(dependencies.sortedNodes, 1, nodeType, "NestedType", "sortedNodes")
      .valuePropertytAtEquals(dependencies.sortedNodes, 2, nodeType, "TypeExample", "sortedNodes")
      .valuePropertytAtEquals(dependencies.sortedNodes, 3, nodeType, "TableExample", "sortedNodes")
      .valuePropertytAtEquals(dependencies.sortedNodes, 4, nodeType, "FunctionWithTypeDependency", "sortedNodes")
      .valuePropertytAtEquals(dependencies.sortedNodes, 5, nodeType, "FunctionWithEnumDependency", "sortedNodes")
      .valuePropertytAtEquals(dependencies.sortedNodes, 6, nodeType, "FunctionWithTableDependency", "sortedNodes")
      .valuePropertytAtEquals(dependencies.sortedNodes, 7, nodeType, "FunctionWithFunctionTypeDependency", "sortedNodes")
      .valuePropertytAtEquals(dependencies.sortedNodes, 8, nodeType, "FunctionWithFunctionDependency", "sortedNodes")
      .valuePropertytAtEquals(dependencies.sortedNodes, 9, nodeType, "ValidateBuiltOrderFunction", "sortedNodes")
      .valuePropertytAtEquals(dependencies.sortedNodes, 10, nodeType, "ValidateBuiltOrder", "sortedNodes")
      .countMapIs(dependencies.circularReferences, 0, "")
    );
  });
});
