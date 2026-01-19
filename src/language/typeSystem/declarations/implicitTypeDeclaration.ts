import type {IValidationContext} from "../../../parser/validationContext";

import {TypeDeclaration} from "./typeDeclaration";
import {Type} from "../type";
import {SourceReference} from "../../../parser/sourceReference";
import {INode} from "../../node";
import {NodeType} from "../../nodeType";

export function instanceOfImplicitTypeDeclaration(object: any): boolean {
  return object?.nodeType == NodeType.ImplicitTypeDeclaration;
}

export function asImplicitTypeDeclaration(object: any): ImplicitTypeDeclaration | null {
  return instanceOfImplicitTypeDeclaration(object) ? object as ImplicitTypeDeclaration : null;
}

export class ImplicitTypeDeclaration extends TypeDeclaration {

  public nodeType = NodeType.ImplicitTypeDeclaration;

  constructor(reference: SourceReference) {
    super(reference);
  }

  protected override validateType(context: IValidationContext): Type {
    if (this.type == null) {
      throw new Error(`Not supported. Nodes should be Validated first.`)
    }
    return this.type;
  }

  public define(type: Type): void {
    super.setType(type);
  }

  public override getChildren(): Array<INode> {
    return [];
  }

  protected override validate(context: IValidationContext): void {
    //suppress base validator
  }

  public override toString() {
    return "(implicit) " + this.type?.toString();
  }
}
