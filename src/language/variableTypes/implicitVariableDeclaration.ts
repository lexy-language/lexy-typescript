import type {IValidationContext} from "../../parser/validationContext";

import {VariableDeclarationType} from "./variableDeclarationType";
import {VariableType} from "./variableType";
import {SourceReference} from "../../parser/sourceReference";
import {INode} from "../node";
import {NodeType} from "../nodeType";

export function instanceOfImplicitVariableDeclaration(object: any): boolean {
  return object?.nodeType == NodeType.ImplicitVariableDeclaration;
}

export function asImplicitVariableDeclaration(object: any): ImplicitVariableDeclaration | null {
  return instanceOfImplicitVariableDeclaration(object) ? object as ImplicitVariableDeclaration : null;
}

export class ImplicitVariableDeclaration extends VariableDeclarationType {

  public nodeType = NodeType.ImplicitVariableDeclaration;

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
