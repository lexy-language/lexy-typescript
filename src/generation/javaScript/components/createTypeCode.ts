import {GeneratedType, GeneratedTypeKind} from "../../generatedType";
import {TypeDefinition} from "../../../language/types/typeDefinition";
import {typeClassName} from "../classNames";
import {createVariableClass} from "../renderers/renderVariableClass";
import {CodeWriter} from "../codeWriter";
import {renderExpression} from "../renderers/renderExpression";

export function createTypeCode(typeDefinition: TypeDefinition): GeneratedType {
  const className = typeClassName(typeDefinition.name.value);
  const codeWriter = new CodeWriter(renderExpression);

  codeWriter.openScope(`function ${className}()`);
  createVariableClass(typeDefinition.name.value, className, typeDefinition.variables, codeWriter);
  codeWriter.writeLine(`return ${className};`);
  codeWriter.closeScope("();");

  return new GeneratedType(GeneratedTypeKind.Type, typeDefinition, className, codeWriter.toString());
}
