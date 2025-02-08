import {VariableDefinition} from "../../../language/variableDefinition";
import {CodeWriter} from "../writers/codeWriter";
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
import {LexyCodeConstants} from "../lexyCodeConstants";
import {Assert} from "../../../infrastructure/assert";
import {asCustomType} from "../../../language/variableTypes/customType";
import {enumClassName, typeClassName} from "../classNames";
import {asPrimitiveType, PrimitiveType} from "../../../language/variableTypes/primitiveType";
import {customVariableIdentifier} from "./customVariableIdentifier";

export function createVariableClass(name: string,
                                    className: string,
                                    variables: ReadonlyArray<VariableDefinition> | undefined,
                                    codeWriter: CodeWriter) {
  codeWriter.openScope(`class ${className}`);

  if (variables) {
    for (const variable of variables) {
      renderVariableDefinition(variable, codeWriter)
    }
  }
  renderValidationFunction(name, variables, codeWriter);

  codeWriter.closeScope();
  codeWriter.writeLine();
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
    codeWriter.renderExpression(variable.defaultExpression);
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
      codeWriter.write(`${LexyCodeConstants.environmentVariable}.Decimal(0)`);
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
      codeWriter.writeEnvironment(`.${translateType(enumType)}.${enumType.firstMemberName()}`)
      return;
    case VariableTypeName.ComplexType:
      const complexType = asComplexType(customType.variableType);
      if (complexType == null) throw new Error("customType.variableType not complexType");
      codeWriter.write(`new `);
      codeWriter.writeEnvironment(`.${translateComplexType(complexType)}`)
      codeWriter.write(`()`);
      return;
    default:
      throw new Error(`Invalid renderDefaultExpressionSyntax: ${customType.variableType?.variableTypeName}`);
  }
}

function renderValidationFunction(name: string, variables: ReadonlyArray<VariableDefinition> | undefined, codeWriter: CodeWriter) {
  codeWriter.openScope(`static ${LexyCodeConstants.validateMethod}(name, value, validationErrors)`);
  codeWriter.writeLine('value = !!value ? value : {};')

  if (variables) {
    for (let index = 0; index < variables.length; index++) {
      const variable = variables[index];
      renderResultValidation(variable, codeWriter);
    }
  }

  codeWriter.closeScope();
}

function renderResultValidation(variable: VariableDefinition, codeWriter: CodeWriter) {
  const optional = variable.defaultExpression != null;
  switch (variable.variableType?.variableTypeName) {
    case VariableTypeName.CustomType:
      const customType = Assert.notNull(asCustomType(variable.variableType), "customType");
      codeWriter.writeLine(`${LexyCodeConstants.environmentVariable}.${typeClassName(customType.type)}.${LexyCodeConstants.validateMethod}(${LexyCodeConstants.environmentVariable}.systemFunctions.variablePath(name, "${variable.name}"), value["${variable.name}"], validationErrors);`)
      break;
    case VariableTypeName.EnumType:
      const enumType = Assert.notNull(asEnumType(variable.variableType), "enumType");
      codeWriter.writeLine(`${LexyCodeConstants.environmentVariable}.${enumClassName(enumType.type)}.${LexyCodeConstants.validateMethod}(${LexyCodeConstants.environmentVariable}.systemFunctions.variablePath(name, "${variable.name}"), value["${variable.name}"], ${optional}, validationErrors);`)
      break;
    case VariableTypeName.PrimitiveType:
      const primitiveType = Assert.notNull(asPrimitiveType(variable.variableType), "primitiveType");
      renderResultsPrimitiveTypeValidation(variable.name, optional, primitiveType, codeWriter);
      break;
    case VariableTypeName.ComplexType:
      const complexType = Assert.notNull(asComplexType(variable.variableType), "complexType");
      codeWriter.writeLine(`${LexyCodeConstants.environmentVariable}.${translateComplexType(complexType)}.${LexyCodeConstants.validateMethod}(${LexyCodeConstants.environmentVariable}.systemFunctions.variablePath(name, "${variable.name}"), value["${variable.name}"], validationErrors);`)
      break;
    default:
      throw new Error(`Unexpected variable type: '${variable.variableType?.variableTypeName}'`)
  }
}

function renderResultsPrimitiveTypeValidation(variableName: string, optional: boolean, primitiveType: PrimitiveType, codeWriter: CodeWriter) {
  const validateMethod = validatePrimitiveTypeMethodName(primitiveType);
  codeWriter.writeLine(`${LexyCodeConstants.environmentVariable}.validate.${validateMethod}(${LexyCodeConstants.environmentVariable}.systemFunctions.variablePath(name, "${variableName}"), value["${variableName}"], ${optional}, validationErrors);`)
}

function validatePrimitiveTypeMethodName(primitiveType: PrimitiveType): string {
  switch (primitiveType.type) {
    case TypeNames.string:
    case TypeNames.boolean:
    case TypeNames.date:
    case TypeNames.number:
      return primitiveType.type;
    default:
      throw new Error(`Invalid primitive type: '${primitiveType.type}'`)
  }
}