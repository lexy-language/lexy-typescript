import {CustomVariableDeclarationType} from "../../../language/variableTypes/customVariableDeclarationType";
import {VariableTypeName} from "../../../language/variableTypes/variableTypeName";
import {asEnumType} from "../../../language/variableTypes/enumType";
import {enumClassName, tableClassName, typeClassName} from "../classNames";
import {asTableType} from "../../../language/variableTypes/tableType";
import {asCustomType} from "../../../language/variableTypes/customType";
import {CodeWriter} from "../writers/codeWriter";

export function customVariableIdentifier(customVariable: CustomVariableDeclarationType, codeWriter: CodeWriter) {
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
    case VariableTypeName.CustomType:
      const customType = asCustomType(customVariable.variableType);
      if (customType == null) throw new Error("Invalid CustomType")
      return codeWriter.identifierFromEnvironment(typeClassName(customType.type));
  }
  throw new Error(`Couldn't map type: ${customVariable.variableType}`)
}