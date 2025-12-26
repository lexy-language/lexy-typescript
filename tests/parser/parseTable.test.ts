import {parseTable} from "../parseFunctions";
import {shouldBePrimitiveType} from "./variableTypeExtensions";
import {TypeNames} from "../../src/language/variableTypes/typeNames";
import {
  validateBooleanLiteralExpression,
  validateDateTimeLiteralExpression,
  validateNumericLiteralExpression,
  validateQuotedLiteralExpression
} from "./expressionParser/expressionTestExtensions";

describe('ParseTablesTests', () => {
  it('testInAndStringColumns', async () => {
    const code = `table TestTable
  | number value | string Result |
  | 7 | "Test quoted" |
  | 8 | "Test" |`;

    const {table} = parseTable(code);

    expect(table.name.value).toBe(`TestTable`);
    expect(table.header?.columns.length).toBe(2);
    expect(table.header?.columns[0].name).toBe(`value`);
    shouldBePrimitiveType(table.header?.columns[0].type, TypeNames.number);
    expect(table.header?.columns[1].name).toBe(`Result`);
    shouldBePrimitiveType(table.header?.columns[1].type, TypeNames.string);
    expect(table.rows.length).toBe(2);
    validateNumericLiteralExpression(table.rows[0].values[0].expression, 7);
    validateQuotedLiteralExpression(table.rows[0].values[1].expression, `Test quoted`);
    validateNumericLiteralExpression(table.rows[1].values[0].expression, 8);
    validateQuotedLiteralExpression(table.rows[1].values[1].expression, `Test`);
  });

  it('testDateTimeAndBoolean', async () => {
    const code = `table TestTable
  | date value | boolean Result |
  | d"2024-12-18T17:07:45" | false |
  | d"2024-12-18T17:08:12" | true |`;

    const {table, _} = parseTable(code);

    expect(table.name.value).toBe(`TestTable`);
    expect(table.header?.columns.length).toBe(2);
    expect(table.header?.columns[0].name).toBe(`value`);
    shouldBePrimitiveType(table.header?.columns[0].type, TypeNames.date);
    expect(table.header?.columns[1].name).toBe(`Result`);
    shouldBePrimitiveType(table.header?.columns[1].type, TypeNames.boolean);
    expect(table.rows.length).toBe(2);
    validateDateTimeLiteralExpression(table.rows[0].values[0].expression, `2024-12-18T17:07:45`);
    validateBooleanLiteralExpression(table.rows[0].values[1].expression, false);
    validateDateTimeLiteralExpression(table.rows[1].values[0].expression, `2024-12-18T17:08:12`);
    validateBooleanLiteralExpression(table.rows[1].values[1].expression, true);
  });
});
