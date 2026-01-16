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
    Verify.model(dependencies, _ => _
      .countMapIs(model => model.nodes, 1)
      .containsKey(model => model.nodes, "SimpleEnum", __ => __
        .areEqual(simpleEnum => simpleEnum.dependencies.size, 0)
        .areEqual(simpleEnum => simpleEnum.dependants.size, 0)
      )
      .valuePropertyAtEquals(model => model.sortedNodes, 0, nodeName, "SimpleEnum")
    );
  });

  it('simpleTable', async () => {
    const dependencies = await buildDependencyGraph(table);
    Verify.model(dependencies, _ => _
      .countMapIs(model => model.nodes, 1)
      .containsKey(model => model.nodes, "SimpleTable", __ => __
        .areEqual(simpleEnum => simpleEnum.dependencies.size, 0)
        .areEqual(simpleEnum => simpleEnum.dependants.size, 0)
      )
      .valuePropertyAtEquals(model => model.sortedNodes, 0, nodeName, "SimpleTable")
    );
  });

  it('simpleFunction', async () => {
    const dependencies = await buildDependencyGraph(functionCode);
    Verify.model(dependencies, _ => _
      .countMapIs(model => model.nodes, 1)
      .containsKey(model => model.nodes, "SimpleFunction", __ => __
        .areEqual(simpleFunction => simpleFunction.dependencies.size, 0)
        .areEqual(simpleFunction => simpleFunction.dependants.size, 0)
      )
      .valuePropertyAtEquals(model => model.sortedNodes, 0, nodeName, "SimpleFunction")
    );
  });

  it('functionNewFunctionExpressionParameters', async () => {
    const dependencies = await buildDependencyGraph(functionCode + `
function Caller
  var params = new(SimpleFunction.Parameters)
`);

    Verify.model(dependencies, _ => _
      .countMapIs(model => model.nodes, 2)
      .containsKey(model => model.nodes, "SimpleFunction", __ => __
        .areEqual(simpleFunction => simpleFunction.dependencies.size, 0)
        .areEqual(simpleFunction => simpleFunction.dependants.size, 1)
        .containsKey(simpleFunction => simpleFunction.dependants, "Caller")
      )
      .containsKey(model => model.nodes, "Caller", __ => __
        .areEqual(caller => caller.dependencies.size, 1)
        .containsKey(caller => caller.dependencies, "SimpleFunction")
        .areEqual(caller => caller.dependants.size, 0)
      )
      .valuePropertyAtEquals(model => model.sortedNodes, 0, nodeName, "SimpleFunction")
      .valuePropertyAtEquals(model => model.sortedNodes, 1, nodeName, "Caller")
    );
  });

  it('functionNewFunctionExpressionResults', async () => {
    const dependencies = await buildDependencyGraph(functionCode + `
function Caller
  var params = new(SimpleFunction.Results)
`);
    Verify.model(dependencies, _ => _
      .countMapIs(model => model.nodes, 2)
      .containsKey(model => model.nodes, "SimpleFunction", __ => __
        .areEqual(simpleFunction => simpleFunction.dependencies.size, 0)
        .areEqual(simpleFunction => simpleFunction.dependants.size, 1)
        .containsKey(simpleFunction => simpleFunction.dependants, "Caller")
      )
      .containsKey(model => model.nodes, "Caller", __ => __
        .areEqual(caller => caller.dependencies.size, 1)
        .containsKey(caller => caller.dependencies, "SimpleFunction")
        .areEqual(caller => caller.dependants.size, 0)
      )
      .valuePropertyAtEquals(model => model.sortedNodes, 0, nodeName, "SimpleFunction")
      .valuePropertyAtEquals(model => model.sortedNodes, 1, nodeName, "Caller")
    );
  });

  it('functionFillFunctionParameters', async () => {
    const dependencies = await buildDependencyGraph(functionCode + `
function Caller
  parameters
    number Value
  var params = fill(SimpleFunction.Parameters)
`);

    Verify.model(dependencies, _ => _
      .countMapIs(model => model.nodes, 2)
      .containsKey(model => model.nodes, "SimpleFunction", __ => __
        .areEqual(simpleFunction => simpleFunction.dependencies.size, 0)
        .areEqual(simpleFunction => simpleFunction.dependants.size, 1)
        .containsKey(simpleFunction => simpleFunction.dependants, "Caller")
      )
      .containsKey(model => model.nodes, "Caller", __ => __
        .areEqual(caller => caller.dependencies.size, 1)
        .containsKey(caller => caller.dependencies, "SimpleFunction")
        .areEqual(caller => caller.dependants.size, 0)
      )
      .valuePropertyAtEquals(model => model.sortedNodes, 0, nodeName, "SimpleFunction")
      .valuePropertyAtEquals(model => model.sortedNodes, 1, nodeName, "Caller")
    );
  });

  it('functionFillFunctionResults', async () => {
    const dependencies = await buildDependencyGraph(functionCode + `
function Caller
  parameters
    number Result
  var params = fill(SimpleFunction.Results)
`);

    Verify.model(dependencies, _ => _
      .countMapIs(model => model.nodes, 2)
      .containsKey(model => model.nodes, "SimpleFunction", __ => __
        .areEqual(simpleFunction => simpleFunction.dependencies.size, 0)
        .areEqual(simpleFunction => simpleFunction.dependants.size, 1)
        .containsKey(simpleFunction => simpleFunction.dependants, "Caller")
      )
      .containsKey(model => model.nodes, "Caller", __ => __
        .areEqual(caller => caller.dependencies.size, 1)
        .containsKey(caller => caller.dependencies, "SimpleFunction")
        .areEqual(caller => caller.dependants.size, 0)
      )
      .valuePropertyAtEquals(model => model.sortedNodes, 0, nodeName, "SimpleFunction")
      .valuePropertyAtEquals(model => model.sortedNodes, 1, nodeName, "Caller")
    );
  });

  it('tableLookup', async () => {
    const dependencies = await buildDependencyGraph(table + `
function Caller
  var result = SimpleTable.LookUp(2, SimpleTable.Search, SimpleTable.Value)
`);

    Verify.model(dependencies, _ => _
      .countMapIs(model => model.nodes, 2)
      .containsKey(model => model.nodes, "SimpleTable", __ => __
        .areEqual(simpleTable => simpleTable.dependencies.size, 0)
        .areEqual(simpleTable => simpleTable.dependants.size, 1)
        .containsKey(simpleTable => simpleTable.dependants, "Caller")
      )
      .containsKey(model => model.nodes, "Caller", __ => __
        .areEqual(caller => caller.dependencies.size, 1)
        .containsKey(caller => caller.dependencies, "SimpleTable")
        .areEqual(caller => caller.dependants.size, 0)
      )
      .valuePropertyAtEquals(model => model.sortedNodes, 0, nodeName, "SimpleTable")
      .valuePropertyAtEquals(model => model.sortedNodes, 1, nodeName, "Caller")
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

    Verify.model(dependencies, _ => _
      .countMapIs(model => model.nodes, 2)
      .containsKey(model => model.nodes, "SimpleFunction", __ => __
        .areEqual(simpleFunction => simpleFunction.dependencies.size, 0)
        .areEqual(simpleFunction => simpleFunction.dependants.size, 1)
        .containsKey(simpleFunction => simpleFunction.dependants, "Simple")
      )
      .containsKey(model => model.nodes, "Simple", __ => __
        .areEqual(caller => caller.dependencies.size, 1)
        .containsKey(caller => caller.dependencies, "SimpleFunction")
        .areEqual(caller => caller.dependencies.size, 1)
      )
      .valuePropertyAtEquals(model => model.sortedNodes, 0, nodeName, "SimpleFunction")
      .valuePropertyAtEquals(model => model.sortedNodes, 1, nodeName, "Simple")
    );
  });

  it('simpleType', async () => {
    const dependencies = await buildDependencyGraph(`
type Simple
  number Value1
  string Value2
`);

    Verify.model(dependencies, _ => _
      .countMapIs(model => model.nodes, 1)
      .containsKey(model => model.nodes, "Simple", __ => __
        .areEqual(simpleFunction => simpleFunction.dependencies.size, 0)
        .areEqual(simpleFunction => simpleFunction.dependants.size, 0)
      )
      .valuePropertyAtEquals(model => model.sortedNodes, 0, nodeName, "Simple")
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

    Verify.model(dependencies, _ => _
      .countMapIs(model => model.nodes, 2)
      .containsKey(model => model.nodes, "Inner", __ => __
        .areEqual(value => value.dependencies.size, 0)
        .areEqual(value => value.dependants.size, 1)
        .containsKey(value => value.dependants, "Parent")
      )
      .containsKey(model => model.nodes, "Parent", __ => __
        .areEqual(value => value.dependencies.size, 1)
        .containsKey(value => value.dependencies, "Inner")
        .areEqual(value => value.dependants.size, 0)
      )
      .valuePropertyAtEquals(model => model.sortedNodes, 0, nodeName, "Inner")
      .valuePropertyAtEquals(model => model.sortedNodes, 1, nodeName, "Parent")
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

    Verify.model(dependencies, _ => _
      .countMapIs(model => model.nodes, 2)
      .containsKey(model => model.nodes, "Inner", __ => __
        .areEqual(value => value.dependencies.size, 1)
        .containsKey(value => value.dependencies, "Parent")
        .areEqual(value => value.dependants.size, 1)
        .containsKey(value => value.dependants, "Parent")
      )
      .containsKey(model => model.nodes, "Parent", __ => __
        .areEqual(value => value.dependencies.size, 1)
        .containsKey(value => value.dependencies, "Inner")
        .areEqual(value => value.dependants.size, 1)
        .containsKey(value => value.dependants, "Inner")
      )
      .countMapIs(model => model.circularReferences, 2)
      .containsKey(model => model.circularReferences, "Inner")
      .containsKey(model => model.circularReferences, "Parent")
      .areEqual(model => model.sortedNodes.length, 2)
    );
  });

  it('circularFunctionCall', async () => {
    const dependencies = await buildDependencyGraph(`
function Inner
  Parent()

function Parent
  Inner()
`, false);

    Verify.model(dependencies, _ => _
      .countMapIs(model => model.nodes, 2)
      .containsKey(model => model.nodes, "Inner", __ => __
        .areEqual(inner => inner.dependencies.size, 1)
        .containsKey(inner => inner.dependencies, "Parent")
        .areEqual(inner => inner.dependants.size, 1)
        .containsKey(inner => inner.dependants, "Parent")
      )
      .containsKey(model => model.nodes, "Parent", __ => __
        .areEqual(parent => parent.dependencies.size, 1)
        .containsKey(parent => parent.dependencies, "Inner")
        .areEqual(parent => parent.dependants.size, 1)
        .containsKey(parent => parent.dependants, "Inner")
      )
      .countMapIs(model => model.circularReferences, 2)
      .containsKey(model => model.circularReferences, "Inner")
      .containsKey(model => model.circularReferences, "Parent")
      .areEqual(model => model.sortedNodes.length, 2)
    );
  });
});
