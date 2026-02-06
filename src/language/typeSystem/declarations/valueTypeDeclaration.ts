import type {IValidationContext} from "../../../parser/context/validationContext";
import type {INode} from "../../node";

import {TypeDeclaration} from "./typeDeclaration";
import {SourceReference} from "../../sourceReference";
import {ValueType} from "../valueType";
import {NodeType} from "../../nodeType";
import {NodeReference} from "../../nodeReference";
import {Symbol} from "../../symbols/symbol";
import {SymbolKind} from "../../symbols/symbolKind";

export function instanceOfValueTypeDeclaration(object: any): boolean {
  return object?.nodeType == NodeType.ValueTypeDeclaration;
}

export function asValueTypeDeclaration(object: any): ValueTypeDeclaration | null {
  return instanceOfValueTypeDeclaration(object) ? object as ValueTypeDeclaration : null;
}

export class ValueTypeDeclaration extends TypeDeclaration {

  public nodeType = NodeType.ValueTypeDeclaration;
  public typeName: string

  constructor(typeName: string, parentReference: NodeReference, reference: SourceReference) {
    super(parentReference, reference);
    this.typeName = typeName;
  }

  public toString(): string {
    return this.typeName;
  }

  protected override validate(context: IValidationContext): void {
    this.setType(ValueType.parse(this.typeName));
  }

  public override getChildren(): Array<INode> {
    return [];
  }

  public override getSymbol(): Symbol | null {
    return new Symbol(this.reference, `value type: ${this.type}`, "", SymbolKind.ValueType);
  }
}
