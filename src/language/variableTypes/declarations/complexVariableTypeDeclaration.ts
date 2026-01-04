import type {IComponentNodeList} from "../../componentNodeList";
import type {IValidationContext} from "../../../parser/validationContext";
import type {INode} from "../../node";
import type {IHasNodeDependencies} from "../../IHasNodeDependencies";
import type {IComponentNode} from "../../componentNode";

import {VariableTypeDeclaration} from "./variableTypeDeclaration";
import {SourceReference} from "../../../parser/sourceReference";
import {VariableType} from "../variableType";
import {NodeType} from "../../nodeType";
import {VariableTypeName} from "../variableTypeName";
import {asDeclaredType} from "../declaredType";
import {asGeneratedType} from "../generatedType";
import {asEnumType} from "../enumType";

export function instanceOfComplexVariableTypeDeclaration(object: any): boolean {
  return object?.nodeType == NodeType.ComplexVariableTypeDeclaration;
}

export function asComplexVariableTypeDeclaration(object: any): ComplexVariableTypeDeclaration | null {
  return instanceOfComplexVariableTypeDeclaration(object) ? object as ComplexVariableTypeDeclaration : null;
}

export class ComplexVariableTypeDeclaration extends VariableTypeDeclaration implements IHasNodeDependencies {

  public readonly nodeType = NodeType.ComplexVariableTypeDeclaration;
  public readonly hasNodeDependencies = true;
  public type: string;

  constructor(type: string, reference: SourceReference) {
    super(reference);
    this.type = type;
  }

  public toString(): string {
    return this.type;
  }

  public getDependencies(componentNodes: IComponentNodeList): ReadonlyArray<IComponentNode> {
    const type = this.getVariableType(componentNodes);
    switch (type?.variableTypeName) {
      case VariableTypeName.DeclaredType: {
        const declaredType = asDeclaredType(type);
        if (declaredType == null) throw new Error("this.variableType is not DeclaredType");
        return [declaredType.typeDefinition];
      }
      case VariableTypeName.GeneratedType: {
        const generatedType = asGeneratedType(type);
        if (generatedType == null) throw new Error("this.variableType is not GeneratedType");
        return [generatedType.node];
      }
      case VariableTypeName.EnumType: {
        const enumDeclaration = asEnumType(type);
        if (enumDeclaration == null) throw new Error("this.variableType is not EnumType");
        return [enumDeclaration.enum];
      }
      default: {
        return [];
      }
    }
  }

  public override validateVariableType(context: IValidationContext): VariableType | null {
    const type = this.getVariableType(context.componentNodes);
    if (type == null) {
      context.logger.fail(this.reference, `Invalid type: '${this.type}'`);
    }
    return type;
  }

  private getVariableType(componentNodes: IComponentNodeList): VariableType | null {
    if (!this.type.includes(".")) {
      return componentNodes.getType(this.type);
    }

    const parts = this.type.split(".");
    if (parts.length > 2) return null;

    const parent = componentNodes.getType(parts[0]);
    if (parent == null) return null;

    return parent.memberType(parts[1], componentNodes);
  }

  public override getChildren(): Array<INode> {
    return [];
  }
}
