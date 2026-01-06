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
import {Assert} from "../../../infrastructure/assert";

export function instanceOfObjectVariableTypeDeclaration(object: any): boolean {
  return object?.nodeType == NodeType.ObjectVariableTypeDeclaration;
}

export function asObjectVariableTypeDeclaration(object: any): ObjectVariableTypeDeclaration | null {
  return instanceOfObjectVariableTypeDeclaration(object) ? object as ObjectVariableTypeDeclaration : null;
}

//Syntax: "Function.Parameters variableName"
//Syntax: "Function.Row variableName"
export class ObjectVariableTypeDeclaration extends VariableTypeDeclaration implements IHasNodeDependencies {

  public readonly nodeType = NodeType.ObjectVariableTypeDeclaration;
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
        const declaredType = Assert.notNull(asDeclaredType(type), "type as DeclaredType");
        return [declaredType.typeDefinition];
      }
      case VariableTypeName.GeneratedType: {
        const generatedType = Assert.notNull(asGeneratedType(type), "type as GeneratedType");
        return [generatedType.node];
      }
      case VariableTypeName.EnumType: {
        const enumDeclaration = Assert.notNull(asEnumType(type), "type as EnumType");
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

  public getNode(componentNodes: IComponentNodeList): IComponentNode | null {
    if (!this.type.includes('.')) {
        return componentNodes.getNode(this.type);
    }

    const parts = this.type.split(".");
    if (parts.length > 2) return null;

    return componentNodes.getNode(parts[0]);
  }

  public override getChildren(): Array<INode> {
    return [];
  }
}
