import {tokenize} from "./tokenize";
import {OperatorType} from "../../src/parser/tokens/operatorType";

describe('OperatorsTests', () => {

  let operators = [
    {value: "=", type: OperatorType.Assignment},
    {value: "+", type: OperatorType.Addition},
    {value: "-", type: OperatorType.Subtraction},
    {value: "*", type: OperatorType.Multiplication},
    {value: "/", type: OperatorType.Division},
    {value: "%", type: OperatorType.Modulus},
    {value: "(", type: OperatorType.OpenParentheses},
    {value: ")", type: OperatorType.CloseParentheses},
    {value: "[", type: OperatorType.OpenBrackets},
    {value: "]", type: OperatorType.CloseBrackets},
    {value: ">", type: OperatorType.GreaterThan},
    {value: "<", type: OperatorType.LessThan},
    {value: ">=", type: OperatorType.GreaterThanOrEqual},
    {value: "<=", type: OperatorType.LessThanOrEqual},
    {value: "==", type: OperatorType.Equals},
    {value: "!=", type: OperatorType.NotEqual},
    {value: "&&", type: OperatorType.And},
    {value: "||", type: OperatorType.Or},
    {value: ",", type: OperatorType.ArgumentSeparator},
    {value: "...", type: OperatorType.Spread}
  ];

  it('TestOperatorAtEndOfLineTokens', () => {

    const builder = [];
    operators.forEach(entry => validateOperatorToken(entry, builder));

    if (builder.length > 0) {
      throw new Error(builder.join("\n"));
    }
  });

  it('TestOperatorWithWhitespaceSuffixTokens', () => {

    const builder = [];
    operators.forEach(entry => validateOperatorToken(entry, builder, value => value += " "));

    if (builder.length > 0) {
      throw new Error(builder.join("\n"));
    }
  });

  function validateOperatorToken(operatorEntry: {value: string, type: OperatorType}, errors: Array<string>, valueModifier: ((value: string) => string) = null) {

    const value = valueModifier != null ? valueModifier(operatorEntry.value) : operatorEntry.value;
    try {
      tokenize(value)
        .count(1)
        .operator(0, operatorEntry.type)
        .assert();
    } catch (error) {
      errors.push(`'${operatorEntry.value}' (${operatorEntry.type}): ${error}`);
    }
  }
});