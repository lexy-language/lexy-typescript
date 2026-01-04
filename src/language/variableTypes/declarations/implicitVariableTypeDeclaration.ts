import type {IValidationContext} from "../../../parser/validationContext";

import {VariableTypeDeclaration} from "./variableTypeDeclaration";
import {VariableType} from "../variableType";
import {SourceReference} from "../../../parser/sourceReference";
import {INode} from "../../node";
import {NodeType} from "../../nodeType";

export function instanceOfImplicitVariableTypeDeclaration(object: any): boolean {
  return object?.nodeType == NodeType.ImplicitVariableTypeDeclaration;
}

export function asImplicitVariableTypeDeclaration(object: any): ImplicitVariableTypeDeclaration | null {
  return instanceOfImplicitVariableTypeDeclaration(object) ? object as ImplicitVariableTypeDeclaration : null;
}

export class ImplicitVariableTypeDeclaration extends VariableTypeDeclaration {

  public nodeType = NodeType.ImplicitVariableTypeDeclaration;

  constructor(reference: SourceReference) {
    super(reference);
  }

  protected override validateVariableType(context: IValidationContext): VariableType {
    if (this.variableType == null) {
      throw new Error(`Not supported. Nodes should be Validated first.`)
    }
    return this.variableType;
  }

  public define(variableType: VariableType): void {
    super.setVariableType(variableType);
  }

  public override getChildren(): Array<INode> {
    return [];
  }

  protected override validate(context: IValidationContext): void {
    //suppress base validator
  }
}
