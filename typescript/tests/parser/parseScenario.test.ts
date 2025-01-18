import {parseScenario} from "../parseFunctions";
import {
  asPrimitiveVariableDeclarationType,
  PrimitiveVariableDeclarationType
} from "../../src/language/variableTypes/primitiveVariableDeclarationType";
import {validateOfType} from "../validateOfType";
import {format} from "../../src/infrastructure/formatting";

describe('ParseScenarioTests', () => {
  it('testValidScenarioKeyword', async () => {
    const code = `Scenario: TestScenario`;

    let {scenario} = parseScenario(code);

    expect(scenario.name.value).toBe(`TestScenario`);
  });

  it('testValidScenario', async () => {
    const code = `Scenario: TestScenario
  Function TestScenarioFunction
  Parameters
    value = 123
  Results
    Result = 456`;

    let {scenario} = parseScenario(code);

    expect(scenario.name.value).toBe(`TestScenario`);
    expect(scenario.functionName.value).toBe(`TestScenarioFunction`);
    expect(scenario.parameters.assignments.length).toBe(1);
    expect(scenario.parameters.assignments[0].variable.parentIdentifier).toBe(`value`);
    expect(scenario.parameters.assignments[0].constantValue.value).toBe(123);
    expect(scenario.results.assignments.length).toBe(1);
    expect(scenario.results.assignments[0].variable.parentIdentifier).toBe(`Result`);
    expect(scenario.results.assignments[0].constantValue.value).toBe(456);
  });

  it('testInvalidScenario', async () => {
    const code = `Scenario: TestScenario
  Functtion TestScenarioFunction
  Parameters
    value = 123
  Results
    Result = 456`;

    let {scenario, logger} = parseScenario(code);

    let errors = logger.errorNodeMessages(scenario);

    expect(logger.nodeHasErrors(scenario)).toBe(true);

    if (errors.length != 4) throw new Error(format(logger.errorNodeMessages(scenario), 2));

    expect(errors[0]).toBe(`tests.lexy(1, 1): ERROR - Scenario has no function, enum, table or expect errors.`);
    expect(errors[1]).toBe(`tests.lexy(2, 3): ERROR - Invalid token 'Functtion'. Keyword expected.`);
    expect(errors[2]).toBe(`tests.lexy(4, 5): ERROR - Unknown variable name: 'value'.`);
    expect(errors[3]).toBe(`tests.lexy(6, 5): ERROR - Unknown variable name: 'Result'.`);
  });

  it('testInvalidNumberValueScenario', async () => {
    const code = `Scenario: TestScenario
  Function:
    Results
      number Result
  Parameters
    value = 12d3
  Results
    Result = 456`;

    let {scenario, logger} = parseScenario(code);

    let errors = logger.errorNodeMessages(scenario);
    expect(errors).toStrictEqual([`tests.lexy(6, 15): ERROR - Invalid number token character: 'd'`]);
  });

  it('testScenarioWithInlineFunction', async () => {
    const code = `Scenario: ValidNumberIntAsParameter
  Function:
    Parameters
      number Value1 = 123
      number Value2 = 456
    Results
      number Result1
      number Result2
    Code
      Result1 = Value1
      Result2 = Value2
  Parameters
    Value1 = 987
    Value2 = 654
  Results
    Result1 = 123
    Result2 = 456`;

    let {scenario} = parseScenario(code);

    expect(scenario.name.value).toBe(`ValidNumberIntAsParameter`);
    if (scenario.functionNode == null) throw new Error("functionNode == null");

    expect(scenario.functionNode.parameters.variables.length).toBe(2);
    expect(scenario.functionNode.parameters.variables[0].name).toBe(`Value1`);
    validateOfType<PrimitiveVariableDeclarationType>(asPrimitiveVariableDeclarationType, scenario.functionNode.parameters.variables[0].type, value =>
      expect(value.type).toBe(`number`));
    expect(scenario.functionNode.parameters.variables[0].defaultExpression.toString()).toBe(`123`);
    expect(scenario.functionNode.parameters.variables[1].name).toBe(`Value2`);
    validateOfType<PrimitiveVariableDeclarationType>(asPrimitiveVariableDeclarationType, scenario.functionNode.parameters.variables[1].type, value =>
      expect(value.type).toBe(`number`));
    expect(scenario.functionNode.parameters.variables[1].defaultExpression.toString()).toBe(`456`);
    expect(scenario.functionNode.results.variables.length).toBe(2);
    expect(scenario.functionNode.results.variables[0].name).toBe(`Result1`);
    validateOfType<PrimitiveVariableDeclarationType>(asPrimitiveVariableDeclarationType, scenario.functionNode.results.variables[0].type, value =>
      expect(value.type).toBe(`number`));
    expect(scenario.functionNode.results.variables[0].defaultExpression).toBeNull();
    expect(scenario.functionNode.results.variables[1].name).toBe(`Result2`);
    validateOfType<PrimitiveVariableDeclarationType>(asPrimitiveVariableDeclarationType, scenario.functionNode.results.variables[1].type, value =>
      expect(value.type).toBe(`number`));
    expect(scenario.functionNode.results.variables[1].defaultExpression).toBeNull();
    expect(scenario.functionNode.code.expressions.length).toBe(2);
    expect(scenario.functionNode.code.expressions[0].toString()).toBe(`Result1=Value1`);
    expect(scenario.functionNode.code.expressions[1].toString()).toBe(`Result2=Value2`);

    expect(scenario.parameters.assignments.length).toBe(2);
    expect(scenario.parameters.assignments[0].variable.parentIdentifier).toBe(`Value1`);
    expect(scenario.parameters.assignments[0].constantValue.value).toBe(987);
    expect(scenario.parameters.assignments[1].variable.parentIdentifier).toBe(`Value2`);
    expect(scenario.parameters.assignments[1].constantValue.value).toBe(654);
    expect(scenario.results.assignments.length).toBe(2);
    expect(scenario.results.assignments[0].variable.parentIdentifier).toBe(`Result1`);
    expect(scenario.results.assignments[0].constantValue.value).toBe(123);
    expect(scenario.results.assignments[1].variable.parentIdentifier).toBe(`Result2`);
    expect(scenario.results.assignments[1].constantValue.value).toBe(456);
  });

  it('testScenarioWithEmptyParametersAndResults', async () => {
    const code = `Scenario: ValidateScenarioKeywords
# Validate Scenario keywords
  Function ValidateFunctionKeywords
  Parameters
  Results`;
    let {scenario} = parseScenario(code);

    expect(scenario.functionName.value).toBe(`ValidateFunctionKeywords`);
    expect(scenario.parameters.assignments.length).toBe(0);
    expect(scenario.results.assignments.length).toBe(0);
  });

  it('testValidScenarioWithInvalidInlineFunction', async () => {
    const code = `Scenario: InvalidNumberEndsWithLetter
  Function:
   Results
    number Result
   Code
    Result = 123A
  ExpectError "Invalid token at 18: Invalid number token character: A"`;

    let {scenario, logger} = parseScenario(code);

    expect(logger.nodeHasErrors(scenario)).toBe(false);
    if (scenario.functionNode == null) throw new Error("scenario.functionNode == null")
    expect(logger.nodeHasErrors(scenario.functionNode)).toBe(true);

    expect(scenario.functionNode).not.toBeNull();
    expect(scenario.expectError).not.toBeNull();
  });

  it('scenarioWithInlineFunctionShouldNotHaveAfunctionNameAfterKeywords', async () => {
    const code = `Scenario: TestScenario
  Function: ThisShouldNotBeAllowed`;

    let {scenario, logger} = parseScenario(code);

    let errors = logger.errorNodeMessages(scenario);

    expect(logger.nodeHasErrors(scenario)).toBe(true);

    expect(errors.length).toBe(1);
    expect(errors[0]).toBe(
      `tests.lexy(2, 13): ERROR - Unexpected function name. ` +
      `Inline function should not have a name: 'ThisShouldNotBeAllowed'`);
  });
});