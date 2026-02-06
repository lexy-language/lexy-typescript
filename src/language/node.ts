import type {IValidationContext} from "../parser/context/validationContext";
import type {NodeType} from "./nodeType";

import {SourceReference} from "./sourceReference";
import {ReadonlySourceArea, SourceArea} from "./sourceArea";
import {Symbol} from "./symbols/symbol";
import {SuggestionEdit} from "./symbols/suggestionEdit";
import {Position} from "./position";
import {NodeReference} from "./nodeReference";
import {Assert} from "../infrastructure/assert";

export interface INode {

  reference: SourceReference;
  area: ReadonlySourceArea;

  parent: INode | null;
  nodeType: NodeType;

  validateTree(context: IValidationContext): void

  getChildren(): readonly INode[];

  getSymbol(): Symbol | null;
  getSuggestions(): readonly SuggestionEdit[] | null;

  expandArea(position: Position): void;
}

export abstract class Node implements INode {

  private readonly parentReference: NodeReference;

  private readonly referenceValue: SourceReference;
  private readonly areaValue: SourceArea;

  public get area() : ReadonlySourceArea {
    return this.areaValue;
  }

  public get reference() : SourceReference {
    return this.referenceValue;
  }

  public get parent() : INode | null {
    return this.parentReference.node;
  }

  protected constructor(parentReference: NodeReference | INode, reference: SourceReference) {
    this.referenceValue = reference;
    this.parentReference = (parentReference as any).parentReference
      ? new NodeReference(parentReference as INode)
      : Assert.notNull(parentReference as NodeReference, "parentReference");
    this.areaValue = new SourceArea(reference);
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

  public abstract getSymbol(): Symbol | null;

  public getSuggestions(): readonly SuggestionEdit[] | null {
    return null;
  }

  protected validateChild(context: IValidationContext, child: INode | null): void {
    if (child == null) throw new Error(`(${this.nodeType}) Child is null`);
    child.validateTree(context);
  }

  protected abstract validate(context: IValidationContext): void;

  public expandArea(position: Position): void {
    this.areaValue.expand(position);
    this.parent?.expandArea(position);
  }

  public equals(other: Node) {
    return this.reference.equals(other.reference);
  }
}
