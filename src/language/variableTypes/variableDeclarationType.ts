import type {IValidationContext} from "../../parser/validationContext";

import {VariableType} from "./variableType";
import {SourceReference} from "../../parser/sourceReference";
import {Node} from "../node"

export abstract class VariableDeclarationType extends Node {

  private variableTypeValue: VariableType | null = null;
  private typeName: string;

  public get variableType(): VariableType | null {
    return this.variableTypeValue;
  }

  protected constructor(typeName: string, reference: SourceReference) {
    super(reference);
    this.typeName = typeName;
  }

  protected setVariableType(value: VariableType | null) {
    this.variableTypeValue = value;
  }

  protected abstract createVariableType(context: IValidationContext): VariableType | null;

  protected override validate(context: IValidationContext): void {
    this.variableTypeValue = this.createVariableType(context);
  }
}