import {ObjectTypeDeclaration} from "../../../language/typeSystem/declarations/objectTypeDeclaration";
import {TypeKind} from "../../../language/typeSystem/typeKind";
import {asEnumType} from "../../../language/typeSystem/enumType";
import {enumClassName, tableClassName, typeClassName} from "../classNames";
import {asTableType} from "../../../language/typeSystem/tableType";
import {asDeclaredType} from "../../../language/typeSystem/objects/declaredType";
import {CodeWriter} from "../codeWriter";

export function customVariableIdentifier(customVariable: ObjectTypeDeclaration, codeWriter: CodeWriter) {
  if (customVariable.type == null) throw new Error("Variable typeDeclaration expected: " + customVariable.nodeType);

  const typeName = customVariable.type.typeKind;
  switch (typeName) {
    case TypeKind.EnumType:
      const enumType = asEnumType(customVariable.type);
      if (enumType == null) throw new Error("Invalid EnumType")
      return codeWriter.identifierFromEnvironment(enumClassName(enumType.name));
    case TypeKind.TableType:
      const tableType = asTableType(customVariable.type);
      if (tableType == null) throw new Error("Invalid TableType")
      return codeWriter.identifierFromEnvironment(tableClassName(tableType.name));
    case TypeKind.DeclaredType:
      const declaredType = asDeclaredType(customVariable.type);
      if (declaredType == null) throw new Error("Invalid DeclaredType")
      return codeWriter.identifierFromEnvironment(typeClassName(declaredType.name));
  }
  throw new Error(`Couldn't map type: ${customVariable.type}`)
}
