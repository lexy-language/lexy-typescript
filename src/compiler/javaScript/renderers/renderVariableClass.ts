import {VariableDefinition} from "../../../language/variableDefinition";
import {CodeWriter} from "../codeWriter";
import {VariableTypeDeclaration} from "../../../language/variableTypes/declarations/variableTypeDeclaration";
import {
  asPrimitiveVariableTypeDeclaration,
  PrimitiveVariableTypeDeclaration
} from "../../../language/variableTypes/declarations/primitiveVariableTypeDeclaration";
import {
  asComplexVariableTypeDeclaration,
  ComplexVariableTypeDeclaration
} from "../../../language/variableTypes/declarations/complexVariableTypeDeclaration";
import {TypeNames} from "../../../language/variableTypes/typeNames";
import {asEnumType} from "../../../language/variableTypes/enumType";
import {VariableTypeName} from "../../../language/variableTypes/variableTypeName";
import {asGeneratedType} from "../../../language/variableTypes/generatedType";
import {LexyCodeConstants} from "../lexyCodeConstants";
import {Assert} from "../../../infrastructure/assert";
import {asDeclaredType} from "../../../language/variableTypes/declaredType";
import {enumClassName, typeClassName} from "../classNames";
import {asPrimitiveType, PrimitiveType} from "../../../language/variableTypes/primitiveType";
import {customVariableIdentifier} from "./customVariableIdentifier";
import {translateGeneratedType, translateType} from "../types";

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

export function renderTypeDefaultExpression(variableTypeDeclaration: VariableTypeDeclaration,
                                            codeWriter: CodeWriter) {

  const primitiveVariableTypeDeclaration = asPrimitiveVariableTypeDeclaration(variableTypeDeclaration);
  if (primitiveVariableTypeDeclaration != null) {
    renderPrimitiveTypeDefaultExpression(primitiveVariableTypeDeclaration, codeWriter);
    return;
  }
  const declaredType = asComplexVariableTypeDeclaration(variableTypeDeclaration);
  if (declaredType != null) {
    renderDefaultExpressionSyntax(declaredType, codeWriter);
    return;
  }
  throw new Error(`Wrong VariableTypeDeclaration ${variableTypeDeclaration.nodeType}`)
}

function renderPrimitiveTypeDefaultExpression(type: PrimitiveVariableTypeDeclaration,
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

function renderDefaultExpressionSyntax(declaredType: ComplexVariableTypeDeclaration,
                                       codeWriter: CodeWriter) {
  switch (declaredType.variableType?.variableTypeName) {
    case VariableTypeName.DeclaredType:
      codeWriter.write(`new ${customVariableIdentifier(declaredType, codeWriter)}()`);
      return;
    case VariableTypeName.EnumType:
      const enumType = asEnumType(declaredType.variableType);
      if (enumType == null) throw new Error("declaredType.variableType not enumType");
      codeWriter.writeEnvironment(`.${translateType(enumType)}.${enumType.firstMemberName()}`)
      return;
    case VariableTypeName.GeneratedType:
      const generatedType = asGeneratedType(declaredType.variableType);
      if (generatedType == null) throw new Error("declaredType.variableType not generatedType");
      codeWriter.write(`new `);
      codeWriter.writeEnvironment(`.${translateGeneratedType(generatedType)}`)
      codeWriter.write(`()`);
      return;
    default:
      throw new Error(`Invalid renderDefaultExpressionSyntax: ${declaredType.variableType?.variableTypeName}`);
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
    case VariableTypeName.DeclaredType:
      const declaredType = Assert.notNull(asDeclaredType(variable.variableType), "declaredType");
      codeWriter.writeLine(`${LexyCodeConstants.environmentVariable}.${typeClassName(declaredType.type)}.${LexyCodeConstants.validateMethod}(${LexyCodeConstants.environmentVariable}.systemFunctions.identifierPath(name, "${variable.name}"), value["${variable.name}"], validationErrors);`)
      break;
    case VariableTypeName.EnumType:
      const enumType = Assert.notNull(asEnumType(variable.variableType), "enumType");
      codeWriter.writeLine(`${LexyCodeConstants.environmentVariable}.${enumClassName(enumType.type)}.${LexyCodeConstants.validateMethod}(${LexyCodeConstants.environmentVariable}.systemFunctions.identifierPath(name, "${variable.name}"), value["${variable.name}"], ${optional}, validationErrors);`)
      break;
    case VariableTypeName.PrimitiveType:
      const primitiveType = Assert.notNull(asPrimitiveType(variable.variableType), "primitiveType");
      renderResultsPrimitiveTypeValidation(variable.name, optional, primitiveType, codeWriter);
      break;
    case VariableTypeName.GeneratedType:
      const generatedType = Assert.notNull(asGeneratedType(variable.variableType), "generatedType");
      codeWriter.writeLine(`${LexyCodeConstants.environmentVariable}.${translateGeneratedType(generatedType)}.${LexyCodeConstants.validateMethod}(${LexyCodeConstants.environmentVariable}.systemFunctions.identifierPath(name, "${variable.name}"), value["${variable.name}"], validationErrors);`)
      break;
    default:
      throw new Error(`Unexpected variable type: '${variable.variableType?.variableTypeName}'`)
  }
}

function renderResultsPrimitiveTypeValidation(variableName: string, optional: boolean, primitiveType: PrimitiveType, codeWriter: CodeWriter) {
  const validateMethod = validatePrimitiveTypeMethodName(primitiveType);
  codeWriter.writeLine(`${LexyCodeConstants.environmentVariable}.validate.${validateMethod}(${LexyCodeConstants.environmentVariable}.systemFunctions.identifierPath(name, "${variableName}"), value["${variableName}"], ${optional}, validationErrors);`)
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