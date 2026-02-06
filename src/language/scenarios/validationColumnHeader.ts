import type {IValidationContext} from "../../parser/context/validationContext";

import {SourceReference} from "../sourceReference";
import {INode, Node} from "../node";
import {NodeType} from "../nodeType";
import {IdentifierPath} from "../identifierPath";
import {NodeReference} from "../nodeReference";
import {Symbol} from "../symbols/symbol";
import {SymbolKind} from "../symbols/symbolKind";

export function instanceOfValidationColumnHeader(object: any) {
  return object?.nodeType == NodeType.ValidationColumnHeader;
}

export function asValidationColumnHeader(object: any): ValidationColumnHeader | null {
  return instanceOfValidationColumnHeader(object) ? object as ValidationColumnHeader : null;
}

export class ValidationColumnHeader extends Node {

  public nodeType = NodeType.ValidationColumnHeader;
  public name: string

  public constructor(name: string, parentReference: NodeReference, reference: SourceReference) {
    super(parentReference, reference);
    this.name = name;
  }

  public static parse(name: string, parentReference: NodeReference, reference: SourceReference): ValidationColumnHeader {
    return new ValidationColumnHeader(name, parentReference, reference);
  }

  public override getChildren(): Array<INode> {
    return [];
  }

  protected override validate(context: IValidationContext): void {
    const identifierPath = IdentifierPath.parseString(this.name);
    const variable = context.variableContext.getTypeByPath(identifierPath);
    if (variable == null) {
      context.logger.fail(this.reference, `Unknown variable: '${this.name}'`);
    }
  }

  public override getSymbol(): Symbol | null {
    return null;
  }
}
