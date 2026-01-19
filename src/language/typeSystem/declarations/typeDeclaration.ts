import type {IValidationContext} from "../../../parser/validationContext";

import {Type} from "../type";
import {SourceReference} from "../../../parser/sourceReference";
import {Node} from "../../node"
  
export abstract class TypeDeclaration extends Node {

  private typeValue: Type | null = null;

  public get type(): Type | null {
    return this.typeValue;
  }

  protected constructor(reference: SourceReference) {
    super(reference);
  }

  protected setType(value: Type | null) {
    this.typeValue = value;
  }

  protected abstract validateType(context: IValidationContext): Type | null;

  protected override validate(context: IValidationContext): void {
    this.typeValue = this.validateType(context);
  }

  public toString(): string {
    return this.type == null ? "unknown" : this.type.toString();
  }
}

