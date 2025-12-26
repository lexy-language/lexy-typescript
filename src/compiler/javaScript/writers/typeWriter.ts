import type {IComponentTokenWriter} from "../../IComponentTokenWriter";
import type {IComponentNode} from "../../../language/componentNode";
import {GeneratedType, GeneratedTypeKind} from "../../generatedType";
import {asTypeDefinition} from "../../../language/types/typeDefinition";
import {typeClassName} from "../classNames";
import {createVariableClass} from "../renderers/renderVariableClass";
import {CodeWriter} from "./codeWriter";
import {Assert} from "../../../infrastructure/assert";
import {renderExpression} from "../renderers/renderExpression";

export class TypeWriter implements IComponentTokenWriter {

  public createCode(node: IComponentNode): GeneratedType {
    const typeDefinition = Assert.notNull(asTypeDefinition(node), "typeDefinition");
    const className = typeClassName(typeDefinition.name.value);
    const codeWriter = new CodeWriter(renderExpression);

    codeWriter.openScope(`function ${className}()`);
    createVariableClass(typeDefinition.name.value, className, typeDefinition.variables, codeWriter);
    codeWriter.writeLine(`return ${className};`);
    codeWriter.closeScope("();");

    return new GeneratedType(GeneratedTypeKind.Type, node, className, codeWriter.toString());
  }
}
