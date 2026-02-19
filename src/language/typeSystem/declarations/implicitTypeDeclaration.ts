import type {IValidationContext} from "../../../parser/context/validationContext";

import {TypeDeclaration} from "./typeDeclaration";
import {Type} from "../type";
import {SourceReference} from "../../sourceReference";
import {INode} from "../../node";
import {NodeType} from "../../nodeType";
import {NodeReference} from "../../nodeReference";
import {Symbol} from "../../symbols/symbol";

export function instanceOfImplicitTypeDeclaration(object: any): boolean {
  return object?.nodeType == NodeType.ImplicitTypeDeclaration;
}

export function asImplicitTypeDeclaration(object: any): ImplicitTypeDeclaration | null {
  return instanceOfImplicitTypeDeclaration(object) ? object as ImplicitTypeDeclaration : null;
}

export class ImplicitTypeDeclaration extends TypeDeclaration {

  public nodeType = NodeType.ImplicitTypeDeclaration;

  constructor(parentReference: NodeReference, reference: SourceReference) {
    super(parentReference, reference);
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

  public override getSymbol(): Symbol | null {
    return this.type ? this.type.getSymbol(this.reference) : null;
  }

  public override label(): string {
    return "var";
  }
}
