import {CodeWriter} from "../writers/codeWriter";
import {VariableTypeName} from "../../../language/variableTypes/variableTypeName";
import {enumClassName, functionClassName, tableClassName, typeClassName} from "../classNames";
import {VariableReference} from "../../../language/variableReference";

export function translateParentVariableClassName(reference: VariableReference, codeWriter: CodeWriter) {
  const parentIdentifier = reference.path.parentIdentifier;
  switch (reference.rootType?.variableTypeName) {
    case VariableTypeName.CustomType:
      return codeWriter.identifierFromEnvironment(typeClassName(parentIdentifier));
    case VariableTypeName.EnumType:
      return codeWriter.identifierFromEnvironment(enumClassName(parentIdentifier));
    case VariableTypeName.FunctionType:
      return codeWriter.identifierFromEnvironment(functionClassName(parentIdentifier));
    case VariableTypeName.TableType:
      return codeWriter.identifierFromEnvironment(tableClassName(parentIdentifier));
    default:
      return  parentIdentifier;
  }
}