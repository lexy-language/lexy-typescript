import {ComplexVariableTypeDeclaration} from "../../../language/variableTypes/declarations/complexVariableTypeDeclaration";
import {VariableTypeName} from "../../../language/variableTypes/variableTypeName";
import {asEnumType} from "../../../language/variableTypes/enumType";
import {enumClassName, tableClassName, typeClassName} from "../classNames";
import {asTableType} from "../../../language/variableTypes/tableType";
import {asDeclaredType} from "../../../language/variableTypes/declaredType";
import {CodeWriter} from "../codeWriter";

export function customVariableIdentifier(customVariable: ComplexVariableTypeDeclaration, codeWriter: CodeWriter) {
  if (customVariable.variableType == null) throw new Error("Variable type expected: " + customVariable.nodeType);

  const variableTypeName = customVariable.variableType.variableTypeName;
  switch (variableTypeName) {
    case VariableTypeName.EnumType:
      const enumType = asEnumType(customVariable.variableType);
      if (enumType == null) throw new Error("Invalid EnumType")
      return codeWriter.identifierFromEnvironment(enumClassName(enumType.type));
    case VariableTypeName.TableType:
      const tableType = asTableType(customVariable.variableType);
      if (tableType == null) throw new Error("Invalid TableType")
      return codeWriter.identifierFromEnvironment(tableClassName(tableType.tableName));
    case VariableTypeName.DeclaredType:
      const declaredType = asDeclaredType(customVariable.variableType);
      if (declaredType == null) throw new Error("Invalid DeclaredType")
      return codeWriter.identifierFromEnvironment(typeClassName(declaredType.type));
  }
  throw new Error(`Couldn't map type: ${customVariable.variableType}`)
}