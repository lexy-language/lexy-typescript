import type {IRootNodeList} from "../rootNodeList";
import type {IValidationContext} from "../../parser/validationContext";
import type {INode} from "../node";
import type {IHasNodeDependencies} from "../IHasNodeDependencies";
import type {IRootNode} from "../rootNode";

import {VariableDeclarationType} from "./variableDeclarationType";
import {SourceReference} from "../../parser/sourceReference";
import {VariableType} from "./variableType";
import {NodeType} from "../nodeType";
import {VariableTypeName} from "./variableTypeName";
import {asCustomType} from "./customType";
import {asComplexType} from "./complexType";

export function instanceOfCustomVariableDeclarationType(object: any): boolean {
  return object?.nodeType == NodeType.CustomVariableDeclarationType;
}

export function asCustomVariableDeclarationType(object: any): CustomVariableDeclarationType | null {
  return instanceOfCustomVariableDeclarationType(object) ? object as CustomVariableDeclarationType : null;
}

export class CustomVariableDeclarationType extends VariableDeclarationType implements IHasNodeDependencies {

  public readonly nodeType = NodeType.CustomVariableDeclarationType;
  public readonly hasNodeDependencies = true;
  public type: string;

  constructor(type: string, reference: SourceReference) {
    super(type, reference);
    this.type = type;
  }

  public toString(): string {
    return this.type;
  }

  public getDependencies(rootNodeList: IRootNodeList): ReadonlyArray<IRootNode> {
    switch (this.variableType?.variableTypeName) {
      case VariableTypeName.CustomType: {
        const customType = asCustomType(this.variableType);
        if (customType == null) throw new Error("this.variableType is not CustomType");
        return [customType.typeDefinition];
      }
      case VariableTypeName.ComplexType: {
        const complexType = asComplexType(this.variableType);
        if (complexType == null) throw new Error("this.variableType is not ComplexType");
        return [complexType.node];
      }
      default: {
        return [];
      }
    }
  }

  public override createVariableType(context: IValidationContext): VariableType | null {
    if (!this.type.includes(".")) {
      return context.rootNodes.getType(this.type);
    }

    const parts = this.type.split(".");
    if (parts.length > 2) {
      context.logger.fail(this.reference, `Invalid type: '${this.type}'`);
      return null;
    }

    const parent = context.rootNodes.getType(parts[0]);
    if (parent == null) {
      context.logger.fail(this.reference, `Invalid type: '${this.type}'`);
      return null;
    }

    return parent.memberType(parts[1], context);
  }

  public override getChildren(): Array<INode> {
    return [];
  }
}
