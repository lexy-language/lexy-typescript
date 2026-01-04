import type {IValidationContext} from "../../../parser/validationContext";
import type {INode} from "../../node";

import {VariableTypeDeclaration} from "./variableTypeDeclaration";
import {SourceReference} from "../../../parser/sourceReference";
import {VariableType} from "../variableType";
import {PrimitiveType} from "../primitiveType";
import {NodeType} from "../../nodeType";

export function instanceOfPrimitiveVariableTypeDeclaration(object: any): boolean {
  return object?.nodeType == NodeType.PrimitiveVariableTypeDeclaration;
}

export function asPrimitiveVariableTypeDeclaration(object: any): PrimitiveVariableTypeDeclaration | null {
  return instanceOfPrimitiveVariableTypeDeclaration(object) ? object as PrimitiveVariableTypeDeclaration : null;
}

export class PrimitiveVariableTypeDeclaration extends VariableTypeDeclaration {

  public nodeType = NodeType.PrimitiveVariableTypeDeclaration;
  public type: string

  constructor(type: string, reference: SourceReference) {
    super(reference);
    this.type = type;
  }

  protected equals(other: PrimitiveVariableTypeDeclaration): boolean {
    return this.type == other.type;
  }

  public toString(): string {
    return this.type;
  }

  protected override validateVariableType(context: IValidationContext): VariableType {
    return PrimitiveType.parse(this.type);
  }

  public override getChildren(): Array<INode> {
    return [];
  }
}
