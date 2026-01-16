import buildDependencyGraph from "./buildDependencyGraph";
import {Verify} from "../verify";

const nodeName = value => value.nodeName;

describe('FactoryTests', () => {
  
  const enumDefinition = `enum SimpleEnum
  First
  Second
`;

  const table = `table SimpleTable
  | number Search | string Value |
  | 0 | "0" |
  | 1 | "1" |
  | 2 | "2" |
`;

  const functionCode = `function SimpleFunction
  parameters
    number Value
  results
    number Result
  Result = Value
`;

  it('simpleEnum', async () => {
    const dependencies = await buildDependencyGraph(enumDefinition);
    Verify.model(_ => _
      .countMapIs(dependencies.nodes, 1, "nodes")
      .containsKey(dependencies.nodes, "SimpleEnum", "nodes",(simpleEnum, __) => __
        .areEqual(simpleEnum.dependencies.size, 0, "simpleEnum.dependencies.size")
        .areEqual(simpleEnum.dependants.size, 0, "simpleEnum.dependants.size")
      )
      .valuePropertytAtEquals(dependencies.sortedNodes, 0, nodeName, "SimpleEnum", "sortedNodes")
    );
  });

  it('simpleTable', async () => {
    const dependencies = await buildDependencyGraph(table);
    Verify.model(_ => _
      .countMapIs(dependencies.nodes, 1, "nodes")
      .containsKey(dependencies.nodes, "SimpleTable", "nodes", (simpleEnum, __) => __
        .areEqual(simpleEnum.dependencies.size, 0, "simpleEnum.dependencies.size")
        .areEqual(simpleEnum.dependants.size, 0, "simpleEnum.dependants.size")
      )
      .valuePropertytAtEquals(dependencies.sortedNodes, 0, nodeName, "SimpleTable", "")
    );
  });

  it('simpleFunction', async () => {
    const dependencies = await buildDependencyGraph(functionCode);
    Verify.model(_ => _
      .countMapIs(dependencies.nodes, 1, "nodes")
      .containsKey(dependencies.nodes, "SimpleFunction", "nodes", (simpleFunction, __) => __
        .areEqual(simpleFunction.dependencies.size, 0, "simpleFunction.dependencies.size")
        .areEqual(simpleFunction.dependants.size, 0, "simpleFunction.dependants.size")
      )
      .valuePropertytAtEquals(dependencies.sortedNodes, 0, nodeName, "SimpleFunction", "sortedNodes")
    );
  });

  it('functionNewFunctionExpressionParameters', async () => {
    const dependencies = await buildDependencyGraph(functionCode + `
function Caller
  var params = new(SimpleFunction.Parameters)
`);

    Verify.model(_ => _
      .countMapIs(dependencies.nodes, 2, "nodes")
      .containsKey(dependencies.nodes, "SimpleFunction", "nodes", (simpleFunction, __) => __
        .areEqual(simpleFunction.dependencies.size, 0, "simpleFunction.dependencies.size")
        .areEqual(simpleFunction.dependants.size, 1, "simpleFunction.dependants.size")
        .containsKey(simpleFunction.dependants, "Caller", "simpleFunction.dependants")
      )
      .containsKey(dependencies.nodes, "Caller", "nodes", (caller, __) => __
        .areEqual(caller.dependencies.size, 1, "caller.dependencies.size")
        .containsKey(caller.dependencies, "SimpleFunction", "caller.dependencies")
        .areEqual(caller.dependants.size, 0, "caller.dependants.size")
      )
      .valuePropertytAtEquals(dependencies.sortedNodes, 0, nodeName, "SimpleFunction", "sortedNodes")
      .valuePropertytAtEquals(dependencies.sortedNodes, 1, nodeName, "Caller", "sortedNodes")
    );
  });

  it('functionNewFunctionExpressionResults', async () => {
    const dependencies = await buildDependencyGraph(functionCode + `
function Caller
  var params = new(SimpleFunction.Results)
`);
    Verify.model(_ => _
      .countMapIs(dependencies.nodes, 2, "nodes")
      .containsKey(dependencies.nodes, "SimpleFunction", "nodes", (simpleFunction, __) => __
        .areEqual(simpleFunction.dependencies.size, 0, "simpleFunction.dependencies.size")
        .areEqual(simpleFunction.dependants.size, 1, "simpleFunction.dependants.size")
        .containsKey(simpleFunction.dependants, "Caller", "simpleFunction.dependants")
      )
      .containsKey(dependencies.nodes, "Caller", "nodes", (caller, __) => __
        .areEqual(caller.dependencies.size, 1, "caller.dependencies.size")
        .containsKey(caller.dependencies, "SimpleFunction", "caller.dependencies")
        .areEqual(caller.dependants.size, 0, "caller.dependants")
      )
      .valuePropertytAtEquals(dependencies.sortedNodes, 0, nodeName, "SimpleFunction", "sortedNodes")
      .valuePropertytAtEquals(dependencies.sortedNodes, 1, nodeName, "Caller", "sortedNodes")
    );
  });

  it('functionFillFunctionParameters', async () => {
    const dependencies = await buildDependencyGraph(functionCode + `
function Caller
  parameters
    number Value
  var params = fill(SimpleFunction.Parameters)
`);

    Verify.model(_ => _
      .countMapIs(dependencies.nodes, 2, "nodes")
      .containsKey(dependencies.nodes, "SimpleFunction", "nodes", (simpleFunction, __) => __
        .areEqual(simpleFunction.dependencies.size, 0, "simpleFunction.dependencies.size")
        .areEqual(simpleFunction.dependants.size, 1, "simpleFunction.dependants.size")
        .containsKey(simpleFunction.dependants, "Caller", "simpleFunction.dependants")
      )
      .containsKey(dependencies.nodes, "Caller", "nodes", (caller, __) => __
        .areEqual(caller.dependencies.size, 1, "caller.dependencies.size")
        .containsKey(caller.dependencies, "SimpleFunction", "caller.dependencies")
        .areEqual(caller.dependants.size, 0, "caller.dependants.size")
      )
      .valuePropertytAtEquals(dependencies.sortedNodes, 0, nodeName, "SimpleFunction", "sortedNodes")
      .valuePropertytAtEquals(dependencies.sortedNodes, 1, nodeName, "Caller", "sortedNodes")
    );
  });

  it('functionFillFunctionResults', async () => {
    const dependencies = await buildDependencyGraph(functionCode + `
function Caller
  parameters
    number Result
  var params = fill(SimpleFunction.Results)
`);

    Verify.model(_ => _
      .countMapIs(dependencies.nodes, 2, "nodes")
      .containsKey(dependencies.nodes, "SimpleFunction", "nodes", (simpleFunction, __) => __
        .areEqual(simpleFunction.dependencies.size, 0, "simpleFunction.dependencies.size")
        .areEqual(simpleFunction.dependants.size, 1, "simpleFunction.dependants.size")
        .containsKey(simpleFunction.dependants, "Caller", "simpleFunction.dependants")
      )
      .containsKey(dependencies.nodes, "Caller", "nodes", (caller, __) => __
        .areEqual(caller.dependencies.size, 1, "caller.dependencies.size")
        .containsKey(caller.dependencies, "SimpleFunction", "caller.dependencies")
        .areEqual(caller.dependants.size, 0, "caller.dependants.size")
      )
      .valuePropertytAtEquals(dependencies.sortedNodes, 0, nodeName, "SimpleFunction", "sortedNodes")
      .valuePropertytAtEquals(dependencies.sortedNodes, 1, nodeName, "Caller", "sortedNodes")
    );
  });

  it('tableLookup', async () => {
    const dependencies = await buildDependencyGraph(table + `
function Caller
  var result = SimpleTable.LookUp(2, SimpleTable.Search, SimpleTable.Value)
`);

    Verify.model(_ => _
      .countMapIs(dependencies.nodes, 2, "")
      .containsKey(dependencies.nodes, "SimpleTable", "nodes", (simpleTable, __) => __
        .areEqual(simpleTable.dependencies.size, 0, "simpleTable.dependencies.size")
        .areEqual(simpleTable.dependants.size, 1, "simpleTable.dependants.size")
        .containsKey(simpleTable.dependants, "Caller", "simpleTable.dependants")
      )
      .containsKey(dependencies.nodes, "Caller", "nodes", (caller, __) => __
        .areEqual(caller.dependencies.size, 1, "caller.dependencies.size")
        .containsKey(caller.dependencies, "SimpleTable", "caller.dependencies")
        .areEqual(caller.dependants.size, 0, "caller.dependants.size")
      )
      .valuePropertytAtEquals(dependencies.sortedNodes, 0, nodeName, "SimpleTable", "sortedNodes")
      .valuePropertytAtEquals(dependencies.sortedNodes, 1, nodeName, "Caller", "sortedNodes")
    );
  });

  it('SimpleScenario', async () => {
    const dependencies = await buildDependencyGraph(functionCode + `
scenario Simple
  function SimpleFunction
  results
    Result = 2
  parameters
    Value = 2
`);

    Verify.model(_ => _
      .countMapIs(dependencies.nodes, 2, "nodes")
      .containsKey(dependencies.nodes, "SimpleFunction", "nodes", (simpleFunction, __) => __
        .areEqual(simpleFunction.dependencies.size, 0, "simpleFunction.dependencies.size")
        .areEqual(simpleFunction.dependants.size, 1, "simpleFunction.dependants.size")
        .containsKey(simpleFunction.dependants, "Simple", "simpleFunction.dependants")
      )
      .containsKey(dependencies.nodes, "Simple", "nodes", (caller, __) => __
        .areEqual(caller.dependencies.size, 1, "caller.dependencies.size")
        .containsKey(caller.dependencies, "SimpleFunction", "caller.dependencies")
        .areEqual(caller.dependencies.size, 1, "caller.dependencies.size")
      )
      .valuePropertytAtEquals(dependencies.sortedNodes, 0, nodeName, "SimpleFunction", "sortedNodes")
      .valuePropertytAtEquals(dependencies.sortedNodes, 1, nodeName, "Simple", "sortedNodes")
    );
  });

  it('simpleType', async () => {
    const dependencies = await buildDependencyGraph(`
type Simple
  number Value1
  string Value2
`);

    Verify.model(_ => _
      .countMapIs(dependencies.nodes, 1, "nodes")
      .containsKey(dependencies.nodes, "Simple", "nodes", (simpleFunction, __) => __
        .areEqual(simpleFunction.dependencies.size, 0, "simpleFunction.dependencies.size")
        .areEqual(simpleFunction.dependants.size, 0, "simpleFunction.dependants.size")
      )
      .valuePropertytAtEquals(dependencies.sortedNodes, 0, nodeName, "Simple", "sortedNodes")
    );
  });

  it('generatedType', async () => {
    const dependencies = await buildDependencyGraph(`
type Inner
  number Value1
  string Value2

type Parent
  number Value1
  string Value2
  Inner Value3
`);

    Verify.model(_ => _
      .countMapIs(dependencies.nodes, 2, "nodes")
      .containsKey(dependencies.nodes, "Inner", "nodes", (value, __) => __
        .areEqual(value.dependencies.size, 0, "value.dependencies.size")
        .areEqual(value.dependants.size, 1, "value.dependants.size")
        .containsKey(value.dependants, "Parent", "value.dependants")
      )
      .containsKey(dependencies.nodes, "Parent", "nodes", (value, __) => __
        .areEqual(value.dependencies.size, 1, "value.dependencies.size")
        .containsKey(value.dependencies, "Inner", "value.dependencies")
        .areEqual(value.dependants.size, 0, "value.dependants")
      )
      .valuePropertytAtEquals(dependencies.sortedNodes, 0, nodeName, "Inner", "")
      .valuePropertytAtEquals(dependencies.sortedNodes, 1, nodeName, "Parent", "")
    );
  });

  it('circularType', async () => {
    const dependencies = await buildDependencyGraph(`
type Inner
  number Value1
  string Value2
  Parent Value3

type Parent
  number Value1
  string Value2
  Inner Value3
`, false);

    Verify.model(_ => _
      .countMapIs(dependencies.nodes, 2, "nodes")
      .containsKey(dependencies.nodes, "Inner", "nodes", (value, __) => __
        .areEqual(value.dependencies.size, 1, "value")
        .containsKey(value.dependencies, "Parent", "value")
        .areEqual(value.dependants.size, 1, "value")
        .containsKey(value.dependants, "Parent", "value")
      )
      .containsKey(dependencies.nodes, "Parent", "nodes", (value, __) => __
        .areEqual(value.dependencies.size, 1, "value")
        .containsKey(value.dependencies, "Inner", "value")
        .areEqual(value.dependants.size, 1, "value")
        .containsKey(value.dependants, "Inner", "value")
      )
      .countMapIs(dependencies.circularReferences, 2, "circularReferences")
      .containsKey(dependencies.circularReferences, "Inner", "circularReferences")
      .containsKey(dependencies.circularReferences, "Parent", "circularReferences")
      .areEqual(dependencies.sortedNodes.length, 2, "sortedNodes.length")
    );
  });

  it('circularFunctionCall', async () => {
    const dependencies = await buildDependencyGraph(`
function Inner
  Parent()

function Parent
  Inner()
`, false);

    Verify.model(_ => _
      .countMapIs(dependencies.nodes, 2, "nodes")
      .containsKey(dependencies.nodes, "Inner", "nodes",(inner, __) => __
        .areEqual(inner.dependencies.size, 1, "inner")
        .containsKey(inner.dependencies, "Parent", "inner")
        .areEqual(inner.dependants.size, 1, "inner")
        .containsKey(inner.dependants, "Parent", "inner")
      )
      .containsKey(dependencies.nodes, "Parent", "nodes",(parent, __) => __
        .areEqual(parent.dependencies.size, 1, "parent")
        .containsKey(parent.dependencies, "Inner", "parent")
        .areEqual(parent.dependants.size, 1, "parent")
        .containsKey(parent.dependants, "Inner", "parent")
      )
      .countMapIs(dependencies.circularReferences, 2, "circularReferences")
      .containsKey(dependencies.circularReferences, "Inner", "circularReferences")
      .containsKey(dependencies.circularReferences, "Parent", "circularReferences")
      .areEqual(dependencies.sortedNodes.length, 2, "sortedNodes.length")
    );
  });
});
