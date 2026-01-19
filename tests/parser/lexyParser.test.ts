import {parseFunction} from "../parseFunctions";
import {validateOfType} from "../validateOfType";
import {
  asValueTypeDeclaration,
  ValueTypeDeclaration
} from "../../src/language/typeSystem/declarations/valueTypeDeclaration";

describe('LexyParserTests', () => {
  it('testSimpleReturn', async () => {
    const code = `function TestSimpleReturn
  results
    number Result
  Result = 777`;

    const {functionNode} = await parseFunction(code);

    expect(functionNode.name).toBe(`TestSimpleReturn`);
    expect(functionNode.results.variables.length).toBe(1);
    expect(functionNode.results.variables[0].name).toBe(`Result`);
    validateOfType<ValueTypeDeclaration>(asValueTypeDeclaration,
      functionNode.results.variables[0].typeDeclaration, type =>
        expect(type.typeName).toBe(`number`));
    expect(functionNode.code.expressions.length).toBe(1);
    expect(functionNode.code.expressions[0].toString()).toBe(`Result=777`);
  });

  it('testFunctionKeywords', async () => {
    const code = `function ValidateFunctionKeywords
  // Validate function keywords
  parameters
  results`;

    const {logger} = await parseFunction(code);
    expect(logger.hasErrors()).toBe(false);
  });
});
