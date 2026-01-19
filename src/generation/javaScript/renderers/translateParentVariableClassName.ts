import {CodeWriter} from "../codeWriter";
import {TypeKind} from "../../../language/typeSystem/typeKind";
import {enumClassName, functionClassName, tableClassName, typeClassName} from "../classNames";
import {VariableReference} from "../../../language/variableReference";

export function translateParentVariableClassName(reference: VariableReference, codeWriter: CodeWriter) {
  const rootIdentifier = reference.path.rootIdentifier;
  switch (reference.componentType?.typeKind) {
    case TypeKind.DeclaredType:
      return codeWriter.identifierFromEnvironment(typeClassName(rootIdentifier));
    case TypeKind.EnumType:
      return codeWriter.identifierFromEnvironment(enumClassName(rootIdentifier));
    case TypeKind.FunctionType:
      return codeWriter.identifierFromEnvironment(functionClassName(rootIdentifier));
    case TypeKind.TableType:
      return codeWriter.identifierFromEnvironment(tableClassName(rootIdentifier));
    default:
      return  rootIdentifier;
  }
}
