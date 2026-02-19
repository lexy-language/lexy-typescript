import {parseScenario} from "../parseFunctions";
import {
  asValueTypeDeclaration,
  ValueTypeDeclaration
} from "../../src/language/typeSystem/declarations/valueTypeDeclaration";
import {validateOfType} from "../validateOfType";
import {format} from "../../src/infrastructure/formatting";
import {Verify} from "../verify";

describe('ParseScenarioTests', () => {
  it('testValidScenarioKeyword', async () => {
    const code = `scenario TestScenario`;

    let {scenario} = await parseScenario(code);

    expect(scenario.name).toBe(`TestScenario`);
  });

  it('testValidScenario', async () => {
    const code = `scenario TestScenario
  function TestScenarioFunction
  parameters
    value = 123
  results
    Result = 456`;

    let {scenario} = await parseScenario(code);

    expect(scenario.name).toBe(`TestScenario`);
    expect(scenario.functionName.value).toBe(`TestScenarioFunction`);

    const parametersAssignments = scenario.parameters.allAssignments();
    expect(parametersAssignments.length).toBe(1);
    expect(parametersAssignments[0].variable.rootIdentifier).toBe(`value`);
    expect(parametersAssignments[0].constantValue.value).toBe(123);

    const resultsAssignments = scenario.results.allAssignments();
    expect(resultsAssignments.length).toBe(1);
    expect(resultsAssignments[0].variable.rootIdentifier).toBe(`Result`);
    expect(resultsAssignments[0].constantValue.value).toBe(456);
  });

  it('testInvalidScenario', async () => {
    const code = `scenario TestScenario
  Functtion TestScenarioFunction
  parameters
    Value = 123
  results
    Result = 456`;

    let {scenario, logger} = await parseScenario(code);

    let errors = logger.errorNodeMessages(scenario);

    expect(logger.nodeHasErrors(scenario)).toBe(true);

    if (errors.length != 4) throw new Error(format(logger.errorNodeMessages(scenario), 2));

    Verify.comparableCollection<string>(errors, _ => _
      .length(4, format(logger.errorMessages(), 2))
      .valueAtEquals(0, "tests.lexy (1:1-21): ERROR - Scenario has no function, enum, table or expect errors.")
      .valueAtEquals(1, "tests.lexy (2:3-32): ERROR - Invalid token 'Functtion'. Keyword expected.")
      .valueAtEquals(2, "tests.lexy (4:5-9): ERROR - Invalid identifier: 'Value'")
      .valueAtEquals(3, "tests.lexy (6:5-10): ERROR - Invalid identifier: 'Result'")
    );
  });

  it('testInvalidNumberValueScenario', async () => {
    const code = `scenario TestScenario
  function
    results
      number Result
  parameters
    value = 12d3
  results
    Result = 456`;

    let {scenario, logger} = await parseScenario(code);

    let errors = logger.errorNodeMessages(scenario);
    expect(errors).toStrictEqual([`tests.lexy (6:15): ERROR - Invalid number token character: 'd'`]);
  });

  it('testScenarioWithInlineFunction', async () => {
    const code = `scenario ValidNumberIntAsParameter
  function
    parameters
      number Value1 = 123
      number Value2 = 456
    results
      number Result1
      number Result2
    Result1 = Value1
    Result2 = Value2
  parameters
    Value1 = 987
    Value2 = 654
  results
    Result1 = 123
    Result2 = 456`;

    let {scenario} = await parseScenario(code);

    Verify.model(scenario, context => context
      .areEqual(value => value.name, "ValidNumberIntAsParameter")
      .isNotNull(value => value.functionNode, functionContext => functionContext
        .collection(value => value.parameters.variables, variablesContext => variablesContext
          .length(2, "value.Parameters.Variables")
          .valueModel(0, itemContext => itemContext
            .areEqual(item => item.name, "Value1")
            .isOfType<ValueTypeDeclaration>(item => item.typeDeclaration, "ValueTypeDeclaration", asValueTypeDeclaration, valueTypeDeclarationContext => valueTypeDeclarationContext
              .areEqual(valueTypeDeclaration => valueTypeDeclaration.typeName, "number")
            )
            .areEqual(item => item.defaultExpression.toString(), "number: 123")
          )
          .valueModel(1, itemContext => itemContext
            .areEqual(item => item.name, "Value2")
            .isOfType<ValueTypeDeclaration>(item => item.typeDeclaration, "ValueTypeDeclaration", asValueTypeDeclaration, valueTypeDeclaration => valueTypeDeclaration
              .areEqual(valueTypeDeclaration => valueTypeDeclaration.typeName, "number")
            )
            .areEqual(item => item.defaultExpression.toString(), "number: 456")
          )
        )
        .collection(value => value.results.variables, variablesContext => variablesContext
          .length(2, "value.Results.Variables")
          .valueModel(0, itemContext => itemContext
            .areEqual(item => item.name, "Result1")
            .isOfType<ValueTypeDeclaration>(item => item.typeDeclaration, "ValueTypeDeclaration", asValueTypeDeclaration, valueTypeDeclarationContext => valueTypeDeclarationContext
              .areEqual(valueTypeDeclaration => valueTypeDeclaration.typeName, "number")
            )
            .isNull(item => item.defaultExpression)
          )
          .valueModel(1, itemContext => itemContext
            .areEqual(item => item.name, "Result2")
            .isOfType<ValueTypeDeclaration>(item => item.typeDeclaration, "ValueTypeDeclaration", asValueTypeDeclaration, valueTypeDeclaration => valueTypeDeclaration
              .areEqual(valueTypeDeclaration => valueTypeDeclaration.typeName, "number")
            )
            .isNull(item => item.defaultExpression, "LiteralExpression: 456")
          )
        )
      )
      .collection(value => value.functionNode.code.expressions, variablesContext => variablesContext
        .length(2, "value.Function.Code.Expressions")
        .valueAt(0, value => value.toString() == "Result1 = Value1")
        .valueAt(1, value => value.toString() == "Result2 = Value2")
      )
      .collection(value => scenario.parameters.allAssignments(), variablesContext => variablesContext
        .length(2, "scenario.Parameters.AllAssignments")
        .valueModel(0, itemContext => itemContext
          .areEqual(value => value.variable.rootIdentifier, "Value1")
          .areEqual(value => value.constantValue.value as number, 987)
        )
        .valueModel(1, itemContext => itemContext
          .areEqual(value => value.variable.rootIdentifier, "Value2")
          .areEqual(value => value.constantValue.value as number, 654)
        )
      )
      .collection(value => scenario.results.allAssignments(), variablesContext => variablesContext
        .length(2, "scenario.Results.AllAssignments")
        .valueModel(0, itemContext => itemContext
          .areEqual(value => value.variable.rootIdentifier, "Result1")
          .areEqual(value => value.constantValue.value as number, 123)
        )
        .valueModel(1, itemContext => itemContext
          .areEqual(value => value.variable.rootIdentifier, "Result2")
          .areEqual(value => value.constantValue.value as number, 456)
        )
      )
    );
  });

  it('testScenarioWithEmptyParametersAndResults', async () => {
    const code = `scenario ValidateScenarioKeywords
// Validate Scenario keywords
  function ValidateFunctionKeywords
  parameters
  results`;
    let {scenario} = await parseScenario(code);

    expect(scenario.functionName.value).toBe(`ValidateFunctionKeywords`);
    expect(scenario.parameters.allAssignments().length).toBe(0);
    expect(scenario.results.allAssignments().length).toBe(0);
  });

  it('testValidScenarioWithInvalidInlineFunction', async () => {
    const code = `scenario InvalidNumberEndsWithLetter
  function
   Results
    number Result
   Code
    Result = 123A
  expectErrors 
    "Invalid token at 18: Invalid number token character: A"`;

    let {scenario, logger} = await parseScenario(code);

    expect(logger.nodeHasErrors(scenario)).toBe(false);
    if (scenario.functionNode == null) throw new Error("scenario.functionNode == null")
    expect(logger.nodeHasErrors(scenario.functionNode)).toBe(true);

    expect(scenario.functionNode).not.toBeNull();
    expect(scenario.expectErrors).not.toBeNull();
  });

  it('ScenarioWithInlineFunctionShouldHaveAFunctionNameAfterKeywords', async () => {
    const code = `scenario TestScenario
  function ThisShouldBeAllowed`;

    let {scenario, logger} = await parseScenario(code);

    expect(logger.hasErrors()).toBe(false);
    expect(logger.nodeHasErrors(scenario)).toBe(false);
  });

  it('scenarioWithInlineFunctionShouldLogErrorOnFunction', async () => {
    const code = `scenario TestScenario
  function
    scenario`;

    let {scenario, logger} = await parseScenario(code);

    expect(logger.nodeHasErrors(scenario.functionNode)).toBe(true);

    const errors = logger.errorNodeMessages(scenario.functionNode);
    expect(errors.length).toBe(1);
    expect(errors[0]).toContain(`Invalid expression: KeywordToken('scenario')`);
  });
});
