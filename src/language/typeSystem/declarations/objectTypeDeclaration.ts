import type {IComponentNodeList} from "../../componentNodeList";
import type {IValidationContext} from "../../../parser/validationContext";
import type {INode} from "../../node";
import type {IHasNodeDependencies} from "../../IHasNodeDependencies";
import type {IComponentNode} from "../../componentNode";

import {TypeDeclaration} from "./typeDeclaration";
import {SourceReference} from "../../../parser/sourceReference";
import {Type} from "../type";
import {NodeType} from "../../nodeType";
import {asObjectType} from "../objects/objectType";

export function instanceOfObjectTypeDeclaration(object: any): boolean {
  return object?.nodeType == NodeType.ObjectTypeDeclaration;
}

export function asObjectTypeDeclaration(object: any): ObjectTypeDeclaration | null {
  return instanceOfObjectTypeDeclaration(object) ? object as ObjectTypeDeclaration : null;
}

//Syntax: "Function.Parameters variableName"
//Syntax: "Function.Row variableName"
export class ObjectTypeDeclaration extends TypeDeclaration implements IHasNodeDependencies {

  public readonly nodeType = NodeType.ObjectTypeDeclaration;
  public readonly hasNodeDependencies = true;
  public typeName: string;

  constructor(typeName: string, reference: SourceReference) {
    super(reference);
    this.typeName = typeName;
  }

  public toString(): string {
    return this.typeName;
  }

  public getDependencies(componentNodes: IComponentNodeList): ReadonlyArray<IComponentNode> {
    const objectType = asObjectType(this.getType(componentNodes));
    if (objectType != null) {
      return objectType.getDependencies(componentNodes);
    }
    return [];
  }

  public override validateType(context: IValidationContext): Type | null {
    const type = this.getType(context.componentNodes);
    if (type == null) {
      context.logger.fail(this.reference, `Invalid type: '${this.typeName}'`);
    }
    return type;
  }

  private getType(componentNodes: IComponentNodeList): Type | null {
    if (!this.typeName.includes(".")) {
      return componentNodes.getType(this.typeName);
    }

    const parts = this.typeName.split(".");
    if (parts.length > 2) return null;

    const parent = componentNodes.getType(parts[0]);
    if (parent == null) return null;

    return parent.memberType(parts[1]);
  }

  public getNode(componentNodes: IComponentNodeList): IComponentNode | null {
    if (!this.typeName.includes('.')) {
        return componentNodes.getNode(this.typeName);
    }

    const parts = this.typeName.split(".");
    if (parts.length > 2) return null;

    return componentNodes.getNode(parts[0]);
  }

  public override getChildren(): Array<INode> {
    return [];
  }
}
