import type {IValidationContext} from "../parser/validationContext";
import type {NodeType} from "./nodeType";

import {SourceReference} from "../parser/sourceReference";

export interface INode {

  nodeType: NodeType;
  reference: SourceReference

  validateTree(context: IValidationContext): void

  getChildren(): readonly INode[];
}

export abstract class Node implements INode {

  private readonly referenceValue: SourceReference;

  public get reference(): SourceReference {
    return this.referenceValue;
  }

  protected constructor(reference: SourceReference) {
    this.referenceValue = reference;
  }

  public validateTree(context: IValidationContext): void {
    context.visitor.enter(this);

    this.validateChildren(context);
    this.validate(context);

    context.visitor.leave(this);
  }

  private validateChildren(context: IValidationContext) {
    let children = this.getChildren();
    children.forEach(child => this.validateChild(context, child));
  }

  public abstract nodeType: NodeType;

  public abstract getChildren(): readonly INode[];

  protected validateChild(context: IValidationContext, child: INode | null): void {
    if (child == null) throw new Error(`(${this.nodeType}) Child is null`);
    child.validateTree(context);
  }

  protected abstract validate(context: IValidationContext): void;
}
