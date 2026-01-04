import {parseFunction} from "../parseFunctions";
import {validateOfType} from "../validateOfType";
import {
  asPrimitiveVariableTypeDeclaration,
  PrimitiveVariableTypeDeclaration
} from "../../src/language/variableTypes/declarations/primitiveVariableTypeDeclaration";

describe('LexyParserTests', () => {
  it('testSimpleReturn', async () => {
    const code = `function TestSimpleReturn
  results
    number Result
  Result = 777`;

    const {functionNode} = parseFunction(code);

    expect(functionNode.name.value).toBe(`TestSimpleReturn`);
    expect(functionNode.results.variables.length).toBe(1);
    expect(functionNode.results.variables[0].name).toBe(`Result`);
    validateOfType<PrimitiveVariableTypeDeclaration>(asPrimitiveVariableTypeDeclaration,
      functionNode.results.variables[0].type, type =>
        expect(type.type).toBe(`number`));
    expect(functionNode.code.expressions.length).toBe(1);
    expect(functionNode.code.expressions[0].toString()).toBe(`Result=777`);
  });

  it('testFunctionKeywords', async () => {
    const code = `function ValidateFunctionKeywords
  // Validate function keywords
  parameters
  results`;

    const {logger} = parseFunction(code);
    expect(logger.hasErrors()).toBe(false);
  });
});
