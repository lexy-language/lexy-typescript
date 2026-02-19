import {parseFunction} from "../parseFunctions";
import {validateOfType} from "../validateOfType";
import {
  asValueTypeDeclaration,
  ValueTypeDeclaration
} from "../../src/language/typeSystem/declarations/valueTypeDeclaration";
import {Verify} from "../verify";
import {asAssignmentExpression, AssignmentExpression} from "../../src/language/expressions/assignmentExpression";

describe('LexyParserTests', () => {
  it('testSimpleReturn', async () => {
    const code = `function TestSimpleReturn
  results
    number Result
  Result = 777`;

    const {functionNode} = await parseFunction(code);

    Verify.model(functionNode, context => context
      .areEqual(value => value.name, "TestSimpleReturn")
      .collection(value => value.results.variables, variablesContext => variablesContext
        .length(1, "value.Results.Variables")
        .valueModel(0, itemContext => itemContext
          .areEqual(item => item.name, "Result")
          .isOfType<ValueTypeDeclaration>(item => item.typeDeclaration, "ValueTypeDeclaration", asValueTypeDeclaration, typeDeclarationContext => typeDeclarationContext
            .areEqual(typeDeclaration => typeDeclaration.typeName, "number"))))
      .collection(value => functionNode.code.expressions, variablesContext => variablesContext
        .length(1, "function.Code.Expressions")
        .valueModelOfType<AssignmentExpression>(0, "AssignmentExpression", asAssignmentExpression, itemContext => itemContext
          .areEqual(item => item.toString(), "Result = 777"))));
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
