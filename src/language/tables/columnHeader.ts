import type {IValidationContext} from "../../parser/validationContext";

import {VariableTypeDeclaration} from "../variableTypes/declarations/variableTypeDeclaration";
import {SourceReference} from "../../parser/sourceReference";
import {INode, Node} from "../node";
import {NodeType} from "../nodeType";
import {VariableTypeDeclarationParser} from "../variableTypes/declarations/variableTypeDeclarationParser";

export function instanceOfColumnHeader(object: any) {
  return object?.nodeType == NodeType.ColumnHeader;
}

export function asColumnHeader(object: any): ColumnHeader | null {
  return instanceOfColumnHeader(object) ? object as ColumnHeader : null;
}

export class ColumnHeader extends Node {

  public nodeType = NodeType.ColumnHeader;
  public name: string
  public type: VariableTypeDeclaration

  constructor(name: string, type: VariableTypeDeclaration, reference: SourceReference) {
    super(reference);
    this.name = name;
    this.type = type;
  }

  public static parse(name: string, typeName: string, reference: SourceReference): ColumnHeader {
    let type = VariableTypeDeclarationParser.parse(typeName, reference);
    return new ColumnHeader(name, type, reference);
  }

  public override getChildren(): Array<INode> {
    return [this.type];
  }

  protected override validate(context: IValidationContext): void {
  }
}
