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
  CustomVariableDeclarationType
} from "../../../language/variableTypes/customVariableDeclarationType";
import {TypeNames} from "../../../language/variableTypes/typeNames";
import {translateComplexType, translateType} from "../types";
import {asEnumType} from "../../../language/variableTypes/enumType";
import {VariableTypeName} from "../../../language/variableTypes/variableTypeName";
import {asComplexType} from "../../../language/variableTypes/complexType";

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
      codeWriter.write('new Date("0001-01-01T00:00:00")');
      return;

    default:
      throw new Error(`Invalid type: ${type.type}`);
  }
}

function renderDefaultExpressionSyntax(customType: CustomVariableDeclarationType,
                                       codeWriter: CodeWriter) {
  switch (customType.variableType?.variableTypeName) {
    case VariableTypeName.CustomType:
      codeWriter.write(`new ${customVariableIdentifier(customType, codeWriter)}()`);
      return;
    case VariableTypeName.EnumType:
      const enumType = asEnumType(customType.variableType);
      if (enumType == null) throw new Error("customType.variableType not enumType");
      codeWriter.writeNamespace(`.${translateType(enumType)}.${enumType.firstMemberName()}`)
      return;
    case VariableTypeName.ComplexType:
      const complexType = asComplexType(customType.variableType);
      if (complexType == null) throw new Error("customType.variableType not complexType");
      codeWriter.write(`new `);
      codeWriter.writeNamespace(`.${translateComplexType(complexType)}`)
      codeWriter.write(`()`);
      return;
    default:
      throw new Error(`Invalid renderDefaultExpressionSyntax: ${customType.variableType?.variableTypeName}`);
  }
}