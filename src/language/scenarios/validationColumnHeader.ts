import type {IValidationContext} from "../../parser/validationContext";

import {SourceReference} from "../../parser/sourceReference";
import {INode, Node} from "../node";
import {NodeType} from "../nodeType";
import {VariablePathParser} from "./variablePathParser";

export function instanceOfValidationColumnHeader(object: any) {
  return object?.nodeType == NodeType.ValidationColumnHeader;
}

export function asValidationColumnHeader(object: any): ValidationColumnHeader | null {
  return instanceOfValidationColumnHeader(object) ? object as ValidationColumnHeader : null;
}

export class ValidationColumnHeader extends Node {

  public nodeType = NodeType.ValidationColumnHeader;
  public name: string

  public constructor(name: string, reference: SourceReference) {
    super(reference);
    this.name = name;
  }

  public static parse(name: string, reference: SourceReference): ValidationColumnHeader {
    return new ValidationColumnHeader(name, reference);
  }

  public override getChildren(): Array<INode> {
    return [];
  }

  protected override validate(context: IValidationContext): void {
    const variablePath = VariablePathParser.parseString(this.name);
    const variable = context.variableContext.getVariableTypeByPath(variablePath, context);
    if (variable == null) {
      context.logger.fail(this.reference, `Unknown variable: '${this.name}'`);
    }
  }
}