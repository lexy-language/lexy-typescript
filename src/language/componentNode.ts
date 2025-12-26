import type {IParsableNode} from "./parsableNode";
import type {IValidationContext} from "../parser/validationContext";
import type {INode} from "./node";

import {ParsableNode} from "./parsableNode";
import {SourceReference} from "../parser/sourceReference";

export function instanceOfComponentNode(object: any): object is IComponentNode {
   return object?.isComponentNode == true;
}

export function asComponentNode(object: any): IComponentNode | null {
   return instanceOfComponentNode(object) ? object as IComponentNode : null;
}

export interface IComponentNode extends IParsableNode {
   isComponentNode: true;
   nodeName: string;
}

export abstract class ComponentNode extends ParsableNode implements IComponentNode {

   public readonly isComponentNode = true;
   public readonly abstract nodeName: string;

   protected constructor(reference: SourceReference){
      super(reference)
   }
}
