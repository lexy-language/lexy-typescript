import type {INode} from "../../src/language/node";

import {parseNodes} from "../parseFunctions";
import {NodesLogger} from "../../src/parser/logging/nodesLogger";
import {instanceOfLexyScriptNode} from "../../src/language/lexyScriptNode";
import {VerifyContext} from "../verifyContext";
import {Verify} from "../verify";
import {NodesWalker} from "../../src/language/nodesWalker";

function verifyParentChildrenAreSet(node: INode, context: VerifyContext) {
  const parent = node.parent;
  if (parent == null) {
    if (!instanceOfLexyScriptNode(node)) {
      context.fail(`Node: ${node.nodeType}.parent should not be null`);
    }
  } else {
    const children = parent.getChildren();
    const contains = children.indexOf(node) >= 0;

    context.isTrue(contains, `'${node.nodeType}' not found as child of '${parent.nodeType}'`);
  }
}

describe('ParentTests', () => {
  it('checkFullModel', async () => {

     const code = `scenario ValidateBuildOrder
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
  let functionParametersFill = fill(FunctionWithTypeDependency.Parameters)
  let functionParametersNew = new(FunctionWithTypeDependency.Parameters)
  let tableParameters = new(TableExample.Row)
  Result = 777

function FunctionWithTypeDependency
  parameters
    TypeExample Example
  results
    number Result
  Result = Example.Nested.result

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
  CivilPartnership`;

    let result = await parseNodes(code);

    NodesLogger.log(result.nodes.values, console.log);

    Verify.all(context =>
        NodesWalker.walkNodes(result.nodes.values, node => verifyParentChildrenAreSet(node, context)));
  });
});
