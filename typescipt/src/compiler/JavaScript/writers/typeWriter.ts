import type {IRootTokenWriter} from "../../IRootTokenWriter";
import type {IRootNode} from "../../../language/rootNode";
import {GeneratedType, GeneratedTypeKind} from "../../generatedType";
import {asTypeDefinition} from "../../../language/types/typeDefinition";
import {typeClassName} from "../classNames";
import {createVariableClass} from "../renderers/renderVariableClass";
import {CodeWriter} from "./codeWriter";

export class TypeWriter implements IRootTokenWriter {

  private readonly namespace: string;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  public createCode(node: IRootNode): GeneratedType {
     const typeDefinition = asTypeDefinition(node);
     if (typeDefinition == null) throw new Error(`Root token not type`);

     const className = typeClassName(typeDefinition.name.value);

     const codeWriter = new CodeWriter(this.namespace);
     createVariableClass(className, typeDefinition.variables, codeWriter);

     return new GeneratedType(GeneratedTypeKind.Type, node, className, codeWriter.toString());
   }
}
