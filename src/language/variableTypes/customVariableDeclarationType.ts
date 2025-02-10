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
    super(reference);
    this.type = type;
  }

  public toString(): string {
    return this.type;
  }

  public getDependencies(rootNodeList: IRootNodeList): ReadonlyArray<IRootNode> {
    const type = this.getVariableType(rootNodeList);
    switch (type?.variableTypeName) {
      case VariableTypeName.CustomType: {
        const customType = asCustomType(type);
        if (customType == null) throw new Error("this.variableType is not CustomType");
        return [customType.typeDefinition];
      }
      case VariableTypeName.ComplexType: {
        const complexType = asComplexType(type);
        if (complexType == null) throw new Error("this.variableType is not ComplexType");
        return [complexType.node];
      }
      default: {
        return [];
      }
    }
  }

  public override validateVariableType(context: IValidationContext): VariableType | null {
    const type = this.getVariableType(context.rootNodes);
    if (type == null) {
      context.logger.fail(this.reference, `Invalid type: '${this.type}'`);
    }
    return type;
  }

  private getVariableType(rootNodes: IRootNodeList): VariableType | null {
    if (!this.type.includes(".")) {
      return rootNodes.getType(this.type);
    }

    const parts = this.type.split(".");
    if (parts.length > 2) return null;

    const parent = rootNodes.getType(parts[0]);
    if (parent == null) return null;

    return parent.memberType(parts[1], rootNodes);
  }

  public override getChildren(): Array<INode> {
    return [];
  }
}
