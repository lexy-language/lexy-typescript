import type {IValidationContext} from "../../../parser/validationContext";
import type {INode} from "../../node";

import {TypeDeclaration} from "./typeDeclaration";
import {SourceReference} from "../../../parser/sourceReference";
import {Type} from "../type";
import {ValueType} from "../valueType";
import {NodeType} from "../../nodeType";

export function instanceOfValueTypeDeclaration(object: any): boolean {
  return object?.nodeType == NodeType.ValueTypeDeclaration;
}

export function asValueTypeDeclaration(object: any): ValueTypeDeclaration | null {
  return instanceOfValueTypeDeclaration(object) ? object as ValueTypeDeclaration : null;
}

export class ValueTypeDeclaration extends TypeDeclaration {

  public nodeType = NodeType.ValueTypeDeclaration;
  public typeName: string

  constructor(typeName: string, reference: SourceReference) {
    super(reference);
    this.typeName = typeName;
  }

  protected equals(other: ValueTypeDeclaration): boolean {
    return this.type == other.type;
  }

  public toString(): string {
    return this.typeName;
  }

  protected override validateType(context: IValidationContext): Type {
    return ValueType.parse(this.typeName);
  }

  public override getChildren(): Array<INode> {
    return [];
  }
}
