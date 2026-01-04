import {GeneratedType, GeneratedTypeKind} from "../../generatedType";
import {Table} from "../../../language/tables/table";
import {tableClassName} from "../classNames";
import {CodeWriter} from "../codeWriter";
import {renderTypeDefaultExpression} from "../renderers/renderVariableClass";
import {LexyCodeConstants} from "../lexyCodeConstants";
import {renderExpression, renderValueExpression} from "../renderers/renderExpression";
import {Assert} from "../../../infrastructure/assert";

export function createTableCode(table: Table): GeneratedType {

  if (table == null) throw new Error(`Component token not Table`);

  const className = tableClassName(table.name.value);

  const codeWriter = new CodeWriter(renderExpression);
  codeWriter.openScope(`function ${className}()`);

  renderRowClass(LexyCodeConstants.rowType, table, codeWriter);
  renderValues(LexyCodeConstants.rowType, table, codeWriter);

  codeWriter.openScope(`return`)
  codeWriter.writeLine(`${LexyCodeConstants.rowType}: ${LexyCodeConstants.rowType},`)
  codeWriter.writeLine(`Count: ${LexyCodeConstants.valuesVariable}.length,`)
  codeWriter.writeLine(`__values: ${LexyCodeConstants.valuesVariable}`)
  codeWriter.closeScope(";")

  codeWriter.closeScope("();");

  return new GeneratedType(GeneratedTypeKind.Table, table, className, codeWriter.toString());
}

function renderRowClass(rowName: string, table: Table, codeWriter: CodeWriter) {
  const header = Assert.notNull(table.header, "tableName.header");

  codeWriter.openScope("class " + rowName);
  for (const column of header.columns) {
    codeWriter.startLine(column.name + " = ")
    renderTypeDefaultExpression(column.type, codeWriter);
    codeWriter.endLine(";")
  }
  codeWriter.startLine("constructor(")
  for (let i = 0; i < header.columns.length; i++) {
    const column = header.columns[i];
    codeWriter.write(column?.name ?? "")
    if (i < header.columns.length - 1) {
      codeWriter.write(", ")
    }
  }
  codeWriter.openInlineScope(")")
  for (const column of header.columns) {
    codeWriter.writeLine(`this.${column.name} = ${column.name} != undefined ? ${column.name} : this.${column.name};`)
  }

  codeWriter.closeScope();
  codeWriter.closeScope();
}

function renderValues(rowName: string, table: Table, codeWriter: CodeWriter) {
  codeWriter.openBrackets(`const ${LexyCodeConstants.valuesVariable} = `);
  for (const row of table.rows) {
    codeWriter.startLine("new " + rowName + "(")
    for (let rowIndex = 0; rowIndex < row.values.length; rowIndex++) {
      const value = row.values[rowIndex].expression;
      renderValueExpression(value, codeWriter)
      if (rowIndex < row.values.length - 1) {
        codeWriter.write(",")
      }
    }
    codeWriter.endLine("),")
  }
  codeWriter.closeBrackets();
}
