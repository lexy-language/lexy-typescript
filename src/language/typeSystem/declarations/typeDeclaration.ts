import type {IValidationContext} from "../../../parser/context/validationContext";

import {Type} from "../type";
import {SourceReference} from "../../sourceReference";
import {Node} from "../../node"
import {NodeReference} from "../../nodeReference";
  
export abstract class TypeDeclaration extends Node {

  private typeValue: Type | null = null;

  public get type(): Type | null {
    return this.typeValue;
  }

  protected constructor(parentReference: NodeReference, reference: SourceReference) {
    super(parentReference, reference);
  }

  protected setType(value: Type | null) {
    this.typeValue = value;
  }

  public toString(): string {
    return this.type == null ? "unknown" : this.type.toString();
  }
}

