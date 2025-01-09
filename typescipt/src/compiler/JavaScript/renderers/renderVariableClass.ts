import {VariableDefinition} from "../../../language/variableDefinition";
import {CodeWriter} from "../writers/codeWriter";
import {customVariableIdentifier, renderExpression} from "./renderExpression";
import {VariableDeclarationType} from "../../../language/variableTypes/variableDeclarationType";
import {
  asPrimitiveVariableDeclarationType,
  PrimitiveVariableDeclarationType
} from "../../../language/variableTypes/primitiveVariableDeclarationType";
import {
  asCustomVariableDeclarationType,
  CustomVariableDeclarationType, instanceOfCustomVariableDeclarationType
} from "../../../language/variableTypes/customVariableDeclarationType";
import {TypeNames} from "../../../language/variableTypes/typeNames";
import {instanceOfCustomType} from "../../../language/variableTypes/customType";
import {translateType} from "../types";
import {asEnumType, instanceOfEnumType} from "../../../language/variableTypes/enumType";

export function createVariableClass(className: string,
                                    variables: ReadonlyArray<VariableDefinition>,
                                    codeWriter: CodeWriter) {
  codeWriter.openScope(`class ${className}`);
  for (const variable of variables) {
    renderVariableDefinition(variable, codeWriter)
  }
  codeWriter.closeScope();
}

function renderVariableDefinition(variable: VariableDefinition,
                                  codeWriter: CodeWriter) {
  codeWriter.startLine(`${variable.name} = `);
  renderDefaultExpression(variable, codeWriter);
  codeWriter.endLine(`;`);
}

function renderDefaultExpression(variable: VariableDefinition,
                                 codeWriter: CodeWriter) {

  if (variable.defaultExpression != null) {
    renderExpression(variable.defaultExpression, codeWriter);
  } else {
    renderTypeDefaultExpression(variable.type, codeWriter);
  }
}

export function renderTypeDefaultExpression(variableDeclarationType: VariableDeclarationType,
                                            codeWriter: CodeWriter) {

  const primitiveVariableDeclarationType = asPrimitiveVariableDeclarationType(variableDeclarationType);
  if (primitiveVariableDeclarationType != null) {
    renderPrimitiveTypeDefaultExpression(primitiveVariableDeclarationType, codeWriter);
    return;
  }
  const customType = asCustomVariableDeclarationType(variableDeclarationType);
  if (customType != null) {
    renderDefaultExpressionSyntax(customType, codeWriter);
    return;
  }
  throw new Error(`Wrong VariableDeclarationType ${variableDeclarationType.nodeType}`)
}

function renderPrimitiveTypeDefaultExpression(type: PrimitiveVariableDeclarationType,
                                              codeWriter: CodeWriter) {
  switch (type.type) {
    case TypeNames.number:
      codeWriter.write("0");
      return;

    case TypeNames.boolean:
      codeWriter.write("false");
      return;

    case TypeNames.string:
      codeWriter.write('""');
      return;

    case TypeNames.date:
      codeWriter.write('new Date(1, 0, 1, 0, 0, 0');
      return;

    default:
      throw new Error(`Invalid type: ${type.type}`);
  }
}

function renderDefaultExpressionSyntax(customType: CustomVariableDeclarationType,
                                       codeWriter: CodeWriter) {
  if (instanceOfCustomType(customType.variableType)) {
    codeWriter.write(`new ${customVariableIdentifier(customType, codeWriter)}()`);
    return;
  } else if (instanceOfEnumType(customType.variableType)) {
    const enumType = asEnumType(customType.variableType);
    codeWriter.writeNamespace(`.${translateType(customType.variableType)}.${enumType?.firstMemberName()}`)
    return;
  } else {
    throw new Error(`Invalid renderDefaultExpressionSyntax: ${customType.variableType?.variableTypeName}`);
  }
}