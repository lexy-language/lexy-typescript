import type {IComponentNodeList} from "../../componentNodeList";
import type {IValidationContext} from "../../../parser/context/validationContext";
import type {INode} from "../../node";
import type {IHasNodeDependencies} from "../../IHasNodeDependencies";
import type {IComponentNode} from "../../componentNode";

import {TypeDeclaration} from "./typeDeclaration";
import {SourceReference} from "../../sourceReference";
import {Type} from "../type";
import {NodeType} from "../../nodeType";
import {asObjectType} from "../objects/objectType";
import {NodeReference} from "../../nodeReference";
import {Symbol} from "../../symbols/symbol";
import {SymbolKind} from "../../symbols/symbolKind";
import {asHasNodeDependencies} from "../../IHasNodeDependencies";

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

  constructor(typeName: string, parentReference: NodeReference, reference: SourceReference) {
    super(parentReference, reference);
    this.typeName = typeName;
  }

  public getDependencies(componentNodes: IComponentNodeList): ReadonlyArray<IComponentNode> {
    const type = this.getType(componentNodes);
    const hasNodeDependencies = asHasNodeDependencies(type);
    if (hasNodeDependencies != null) {
      return hasNodeDependencies.getDependencies(componentNodes);
    }
    return [];
  }

  public override validate(context: IValidationContext): void {
    const type = this.getType(context.componentNodes);
    if (type == null) {
      context.logger.fail(this.reference, `Invalid type: '${this.typeName}'`);
    }
    this.setType(type);
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

  public override getSymbol(): Symbol | null {
    return this.type?.getSymbol(this.reference)
      ?? new Symbol(this.reference, "unknown", "", SymbolKind.Keyword);
  }

  public toString(): string {
    return this.typeName;
  }

  public override label(): string {
    return this.typeName;
  }
}
