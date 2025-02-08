import {Validate} from "../../src/runTime/validate";
import Decimal from "decimal.js";

describe('validateFunctions', () => {
  type ValidateTestCase = [numberA: any, error: string | null];

  it("optionalVariablesCanBeUndefined", async () => {
    const errors: Array<string> = [];
    Validate.string("param", undefined, true, errors);
    checkError(null, errors);
  });

  it.each<ValidateTestCase>([
    ["", null],
    ["aaa", null],
    ["abc", null],
    [5, "'param' should have a 'string' value. Invalid type: "],
    [false, "'param' should have a 'string' value. Invalid type: "],
    [new Date(), "'param' should have a 'string' value. Invalid type: "],
  ])("string '%o' validation result '%s'", (value, error) => {
    const errors: Array<string> = [];
    Validate.string("param", value, false, errors);
    checkError(error, errors);
  });

  it.each<ValidateTestCase>([
    [Decimal(5), null],
    [Decimal(55.66), null],
    [Decimal(-486.87), null],
    ["5", "'param' should have a 'number' value. Invalid type: "],
    [false, "'param' should have a 'number' value. Invalid type: "],
    [new Date(), "'param' should have a 'number' value. Invalid type: "],
    [parseInt("a"), "'param' should have a 'number' value. Invalid number value: 'NaN'"],
    [1 / 0, "'param' should have a 'number' value. Invalid number value: 'Infinity'"],
  ])("number '%o' validation result '%s'", (value, error) => {
    const errors: Array<string> = [];
    Validate.number("param", value, false, errors);
    checkError(error, errors);
  });

  it.each<ValidateTestCase>([
    [true, null],
    [false, null],
    ["true", "'param' should have a 'boolean' value. Invalid type: "],
    ["false", "'param' should have a 'boolean' value. Invalid type: "],
    [new Date(), "'param' should have a 'boolean' value. Invalid type: "],
    [123, "'param' should have a 'boolean' value. Invalid type: "],
  ])("boolean '%o' validation result '%s'", (value, error) => {
    const errors: Array<string> = [];
    Validate.boolean("param", value, false, errors)
    checkError(error, errors);
  });

  it.each<ValidateTestCase>([
    [new Date(), null],
    [new Date("2024/12/31 12:12:13"), null],
    ["2024/12/31 12:12:13", "'param' should have a 'date' value. Invalid type: "],
    [false, "'param' should have a 'date' value. Invalid type: "],
    [123, "'param' should have a 'date' value. Invalid type: "],
    [new Date("abc"), "'param' should have a 'date' value. Invalid date value: 'Invalid Date'"],
  ])("date '%o' validation result '%s'", (value, error) => {
    const errors: Array<string> = [];
    Validate.date("param", value, false, errors);
    checkError(error, errors);
  });

  function checkError(error, errors: Array<string>) {
    if (error == null) {
      if (errors.length != 0) {
        throw new Error("No error expected: " + errors[0]);
      }
    } else {
      if (errors.length != 1 && !errors[0].startsWith(error)) {
        throw new Error("Invalid error: " + errors[0]);
      }
    }
  }
});