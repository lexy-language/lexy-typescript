import type {IParsableNode} from "./parsableNode";

import {ParsableNode} from "./parsableNode";
import {SourceReference} from "./sourceReference";
import {INodeWithName} from "./nodeWithName";
import {NodeReference} from "./nodeReference";

export function instanceOfComponentNode(object: any): object is IComponentNode {
   return object?.isComponentNode == true;
}

export function asComponentNode(object: any): IComponentNode | null {
   return instanceOfComponentNode(object) ? object as IComponentNode : null;
}

export interface IComponentNode extends IParsableNode, INodeWithName {
   isComponentNode: true;
}

export abstract class ComponentNode extends ParsableNode implements IComponentNode {

   public readonly isComponentNode = true;
   public readonly isNodeWithName = true;
   public readonly name: string;

   protected constructor(name: string, parentReference: NodeReference, reference: SourceReference){
      super(parentReference, reference);
      this.name = name;
   }
}
