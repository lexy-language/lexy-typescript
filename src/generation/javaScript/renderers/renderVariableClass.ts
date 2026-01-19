import {VariableDefinition} from "../../../language/variableDefinition";
import {CodeWriter} from "../codeWriter";
import {TypeDeclaration} from "../../../language/typeSystem/declarations/typeDeclaration";
import {
  asValueTypeDeclaration,
  ValueTypeDeclaration
} from "../../../language/typeSystem/declarations/valueTypeDeclaration";
import {
  asObjectTypeDeclaration,
  ObjectTypeDeclaration
} from "../../../language/typeSystem/declarations/objectTypeDeclaration";
import {TypeNames} from "../../../language/typeSystem/typeNames";
import {asEnumType} from "../../../language/typeSystem/enumType";
import {TypeKind} from "../../../language/typeSystem/typeKind";
import {asGeneratedType} from "../../../language/typeSystem/objects/generatedType";
import {LexyCodeConstants} from "../lexyCodeConstants";
import {Assert} from "../../../infrastructure/assert";
import {asDeclaredType} from "../../../language/typeSystem/objects/declaredType";
import {enumClassName, typeClassName} from "../classNames";
import {asValueType, ValueType} from "../../../language/typeSystem/valueType";
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
    renderTypeDefaultExpression(variable.typeDeclaration, codeWriter);
  }
}

export function renderTypeDefaultExpression(typeDeclaration: TypeDeclaration,
                                            codeWriter: CodeWriter) {

  const valueTypeDeclaration = asValueTypeDeclaration(typeDeclaration);
  if (valueTypeDeclaration != null) {
    renderValueTypeDefaultExpression(valueTypeDeclaration, codeWriter);
    return;
  }
  const declaredType = asObjectTypeDeclaration(typeDeclaration);
  if (declaredType != null) {
    renderDefaultExpressionSyntax(declaredType, codeWriter);
    return;
  }
  throw new Error(`Wrong TypeDeclaration ${typeDeclaration.nodeType}`)
}

function renderValueTypeDefaultExpression(type: ValueTypeDeclaration,
                                              codeWriter: CodeWriter) {
  switch (type.typeName) {
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

function renderDefaultExpressionSyntax(declaredType: ObjectTypeDeclaration,
                                       codeWriter: CodeWriter) {
  switch (declaredType.type?.typeKind) {
    case TypeKind.DeclaredType:
      codeWriter.write(`new ${customVariableIdentifier(declaredType, codeWriter)}()`);
      return;
    case TypeKind.EnumType:
      const enumType = asEnumType(declaredType.type);
      if (enumType == null) throw new Error("declaredType.type not enumType");
      codeWriter.writeEnvironment(`.${translateType(enumType)}.${enumType.firstMemberName()}`)
      return;
    case TypeKind.GeneratedType:
      const generatedType = asGeneratedType(declaredType.type);
      if (generatedType == null) throw new Error("declaredType.type not generatedType");
      codeWriter.write(`new `);
      codeWriter.writeEnvironment(`.${translateGeneratedType(generatedType)}`)
      codeWriter.write(`()`);
      return;
    default:
      throw new Error(`Invalid renderDefaultExpressionSyntax: ${declaredType.type?.typeKind}`);
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
  switch (variable.type?.typeKind) {
    case TypeKind.DeclaredType:
      const declaredType = Assert.notNull(asDeclaredType(variable.type), "declaredType");
      codeWriter.writeLine(`${LexyCodeConstants.environmentVariable}.${typeClassName(declaredType.name)}.${LexyCodeConstants.validateMethod}(${LexyCodeConstants.environmentVariable}.systemFunctions.identifierPath(name, "${variable.name}"), value["${variable.name}"], validationErrors);`)
      break;
    case TypeKind.EnumType:
      const enumType = Assert.notNull(asEnumType(variable.type), "enumType");
      codeWriter.writeLine(`${LexyCodeConstants.environmentVariable}.${enumClassName(enumType.name)}.${LexyCodeConstants.validateMethod}(${LexyCodeConstants.environmentVariable}.systemFunctions.identifierPath(name, "${variable.name}"), value["${variable.name}"], ${optional}, validationErrors);`)
      break;
    case TypeKind.ValueType:
      const valueType = Assert.notNull(asValueType(variable.type), "valueType");
      renderResultsValueTypeValidation(variable.name, optional, valueType, codeWriter);
      break;
    case TypeKind.GeneratedType:
      const generatedType = Assert.notNull(asGeneratedType(variable.type), "generatedType");
      codeWriter.writeLine(`${LexyCodeConstants.environmentVariable}.${translateGeneratedType(generatedType)}.${LexyCodeConstants.validateMethod}(${LexyCodeConstants.environmentVariable}.systemFunctions.identifierPath(name, "${variable.name}"), value["${variable.name}"], validationErrors);`)
      break;
    default:
      throw new Error(`Unexpected variable type: '${variable.type?.typeKind}'`)
  }
}

function renderResultsValueTypeValidation(variableName: string, optional: boolean, valueType: ValueType, codeWriter: CodeWriter) {
  const validateMethod = validateValueTypeMethodName(valueType);
  codeWriter.writeLine(`${LexyCodeConstants.environmentVariable}.validate.${validateMethod}(${LexyCodeConstants.environmentVariable}.systemFunctions.identifierPath(name, "${variableName}"), value["${variableName}"], ${optional}, validationErrors);`)
}

function validateValueTypeMethodName(valueType: ValueType): string {
  switch (valueType.type) {
    case TypeNames.string:
    case TypeNames.boolean:
    case TypeNames.date:
    case TypeNames.number:
      return valueType.type;
    default:
      throw new Error(`Invalid value type: '${valueType.type}'`)
  }
}
