import buildDependencyGraph from "./buildDependencyGraph";

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
    const dependencies = buildDependencyGraph(enumDefinition);
    expect(dependencies.dependencyNodes.length).toBe(1);
    expect(dependencies.dependencyNodes[0].name).toBe(`SimpleEnum`);
    expect(dependencies.dependencyNodes[0].dependencies.length).toBe(0);
  });

  it('simpleTable', async () => {
    const dependencies = buildDependencyGraph(table);
    expect(dependencies.dependencyNodes.length).toBe(1);
    expect(dependencies.dependencyNodes[0].name).toBe(`SimpleTable`);
    expect(dependencies.dependencyNodes[0].dependencies.length).toBe(0);
  });

  it('simpleFunction', async () => {
    const dependencies = buildDependencyGraph(functionCode);
    expect(dependencies.dependencyNodes.length).toBe(1);
    expect(dependencies.dependencyNodes[0].name).toBe(`SimpleFunction`);
    expect(dependencies.dependencyNodes[0].dependencies.length).toBe(0);
  });

  it('functionNewFunctionExpressionParameters', async () => {
    const dependencies = buildDependencyGraph(functionCode + `
function Caller
  var params = new(SimpleFunction.Parameters)
`);

    expect(dependencies.dependencyNodes.length).toBe(2);
    expect(dependencies.dependencyNodes[0].name).toBe(`SimpleFunction`);
    expect(dependencies.dependencyNodes[0].dependencies.length).toBe(0);
    expect(dependencies.dependencyNodes[1].name).toBe(`Caller`);
    expect(dependencies.dependencyNodes[1].dependencies.length).toBe(1);
    expect(dependencies.dependencyNodes[1].dependencies[0]).toBe(`SimpleFunction`);
  });

  it('functionNewFunctionExpressionResults', async () => {
    const dependencies = buildDependencyGraph(functionCode + `
function Caller
  var params = new(SimpleFunction.Results)
`);

    expect(dependencies.dependencyNodes.length).toBe(2);
    expect(dependencies.dependencyNodes[0].name).toBe(`SimpleFunction`);
    expect(dependencies.dependencyNodes[0].dependencies.length).toBe(0);
    expect(dependencies.dependencyNodes[1].name).toBe(`Caller`);
    expect(dependencies.dependencyNodes[1].dependencies.length).toBe(1);
    expect(dependencies.dependencyNodes[1].dependencies[0]).toBe(`SimpleFunction`);
  });

  it('functionFillFunctionParameters', async () => {
    const dependencies = buildDependencyGraph(functionCode + `
function Caller
  parameters
    number Value
  var params = fill(SimpleFunction.Parameters)
`);

    expect(dependencies.dependencyNodes.length).toBe(2);
    expect(dependencies.dependencyNodes[0].name).toBe(`SimpleFunction`);
    expect(dependencies.dependencyNodes[0].dependencies.length).toBe(0);
    expect(dependencies.dependencyNodes[1].name).toBe(`Caller`);
    expect(dependencies.dependencyNodes[1].dependencies.length).toBe(1);
    expect(dependencies.dependencyNodes[1].dependencies[0]).toBe(`SimpleFunction`);
  });

  it('functionFillFunctionResults', async () => {
    const dependencies = buildDependencyGraph(functionCode + `
function Caller
  parameters
    number Result
  var params = fill(SimpleFunction.Results)
`);

    expect(dependencies.dependencyNodes.length).toBe(2);
    expect(dependencies.dependencyNodes[0].name).toBe(`SimpleFunction`);
    expect(dependencies.dependencyNodes[0].dependencies.length).toBe(0);
    expect(dependencies.dependencyNodes[1].name).toBe(`Caller`);
    expect(dependencies.dependencyNodes[1].dependencies.length).toBe(1);
    expect(dependencies.dependencyNodes[1].dependencies[0]).toBe(`SimpleFunction`);
  });

  it('tableLookup', async () => {
    const dependencies = buildDependencyGraph(table + `
function Caller
  var result = SimpleTable.LookUp(2, SimpleTable.Search, SimpleTable.Value)
`);

    expect(dependencies.dependencyNodes.length).toBe(2);
    expect(dependencies.dependencyNodes[0].name).toBe(`SimpleTable`);
    expect(dependencies.dependencyNodes[0].dependencies.length).toBe(0);
    expect(dependencies.dependencyNodes[1].name).toBe(`Caller`);
    expect(dependencies.dependencyNodes[1].dependencies.length).toBe(1);
    expect(dependencies.dependencyNodes[1].dependencies[0]).toBe(`SimpleTable`);
  });

  it('SimpleScenario', async () => {
    const dependencies = buildDependencyGraph(functionCode + `
scenario Simple
  function SimpleFunction
  results
    Result = 2
  parameters
    Value = 2
`);
    expect(dependencies.dependencyNodes.length).toBe(2);
    expect(dependencies.dependencyNodes[0].name).toBe(`SimpleFunction`);
    expect(dependencies.dependencyNodes[0].dependencies.length).toBe(0);
    expect(dependencies.dependencyNodes[1].name).toBe(`Simple`);
    expect(dependencies.dependencyNodes[1].dependencies.length).toBe(1);
    expect(dependencies.dependencyNodes[1].dependencies[0]).toBe("SimpleFunction");
  });

  it('simpleType', async () => {
    const dependencies = buildDependencyGraph(`
type Simple
  number Value1
  string Value2
`);
    expect(dependencies.dependencyNodes.length).toBe(1);
    expect(dependencies.dependencyNodes[0].name).toBe(`Simple`);
    expect(dependencies.dependencyNodes[0].dependencies.length).toBe(0);
  });

  it('generatedType', async () => {
    const dependencies = buildDependencyGraph(`
type Inner
  number Value1
  string Value2

type Parent
  number Value1
  string Value2
  Inner Value3
`);
    expect(dependencies.dependencyNodes.length).toBe(2);
    expect(dependencies.dependencyNodes[0].name).toBe(`Inner`);
    expect(dependencies.dependencyNodes[0].dependencies.length).toBe(0);
    expect(dependencies.dependencyNodes[1].name).toBe(`Parent`);
    expect(dependencies.dependencyNodes[1].dependencies.length).toBe(1);
  });

  it('circularType', async () => {
    const dependencies = buildDependencyGraph(`
type Inner
  number Value1
  string Value2
  Parent Value3

type Parent
  number Value1
  string Value2
  Inner Value3
`, false);

    expect(dependencies.dependencyNodes.length).toBe(2);
    expect(dependencies.dependencyNodes[0].name).toBe(`Inner`);
    expect(dependencies.dependencyNodes[0].dependencies.length).toBe(1);
    expect(dependencies.dependencyNodes[1].name).toBe(`Parent`);
    expect(dependencies.dependencyNodes[1].dependencies.length).toBe(1);
    expect(dependencies.circularReferences.length).toBe(2);
    expect(dependencies.circularReferences[0].nodeName).toBe(`Inner`);
    expect(dependencies.circularReferences[1].nodeName).toBe(`Parent`);
  });

  it('circularFunctionCall', async () => {
    const dependencies = buildDependencyGraph(`
function Inner
  Parent()

function Parent
  Inner()
`, false);

    expect(dependencies.dependencyNodes.length).toBe(2);
    expect(dependencies.dependencyNodes[0].name).toBe(`Inner`);
    expect(dependencies.dependencyNodes[0].dependencies.length).toBe(1);
    expect(dependencies.dependencyNodes[1].name).toBe(`Parent`);
    expect(dependencies.dependencyNodes[1].dependencies.length).toBe(1);
    expect(dependencies.circularReferences.length).toBe(2);
    expect(dependencies.circularReferences[0].nodeName).toBe(`Inner`);
    expect(dependencies.circularReferences[1].nodeName).toBe(`Parent`);
  });
});
