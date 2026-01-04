import {CodeWriter} from "../codeWriter";
import {VariableTypeName} from "../../../language/variableTypes/variableTypeName";
import {enumClassName, functionClassName, tableClassName, typeClassName} from "../classNames";
import {VariableReference} from "../../../language/variableReference";

export function translateParentVariableClassName(reference: VariableReference, codeWriter: CodeWriter) {
  const rootIdentifier = reference.path.rootIdentifier;
  switch (reference.componentType?.variableTypeName) {
    case VariableTypeName.DeclaredType:
      return codeWriter.identifierFromEnvironment(typeClassName(rootIdentifier));
    case VariableTypeName.EnumType:
      return codeWriter.identifierFromEnvironment(enumClassName(rootIdentifier));
    case VariableTypeName.FunctionType:
      return codeWriter.identifierFromEnvironment(functionClassName(rootIdentifier));
    case VariableTypeName.TableType:
      return codeWriter.identifierFromEnvironment(tableClassName(rootIdentifier));
    default:
      return  rootIdentifier;
  }
}