import type {IParsableNode} from "./parsableNode";
import type {IValidationContext} from "../parser/validationContext";
import type {INode} from "./node";

import {ParsableNode} from "./parsableNode";
import {SourceReference} from "../parser/sourceReference";

export function instanceOfRootNode(object: any): object is IRootNode {
   return object?.isRootNode == true;
}

export function asRootNode(object: any): IRootNode | null {
   return instanceOfRootNode(object) ? object as IRootNode : null;
}

export interface IRootNode extends IParsableNode {
   isRootNode: true;
   nodeName: string;
}

export abstract class RootNode extends ParsableNode implements IRootNode {

   public readonly isRootNode = true;
   public readonly abstract nodeName: string;

   protected constructor(reference: SourceReference){
      super(reference)
   }
}
