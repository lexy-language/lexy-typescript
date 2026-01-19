import type {IValidationContext} from "../../parser/validationContext";

import {TypeDeclaration} from "../typeSystem/declarations/typeDeclaration";
import {SourceReference} from "../../parser/sourceReference";
import {INode, Node} from "../node";
import {NodeType} from "../nodeType";
import {TypeDeclarationParser} from "../typeSystem/declarations/typeDeclarationParser";

export function instanceOfColumnHeader(object: any) {
  return object?.nodeType == NodeType.ColumnHeader;
}

export function asColumnHeader(object: any): ColumnHeader | null {
  return instanceOfColumnHeader(object) ? object as ColumnHeader : null;
}

export class ColumnHeader extends Node {

  public nodeType = NodeType.ColumnHeader;
  public name: string
  public typeDeclaration: TypeDeclaration

  constructor(name: string, type: TypeDeclaration, reference: SourceReference) {
    super(reference);
    this.name = name;
    this.typeDeclaration = type;
  }

  public static parse(name: string, typeName: string, reference: SourceReference): ColumnHeader {
    let type = TypeDeclarationParser.parse(typeName, reference);
    return new ColumnHeader(name, type, reference);
  }

  public override getChildren(): Array<INode> {
    return [this.typeDeclaration];
  }

  protected override validate(context: IValidationContext): void {
  }
}
