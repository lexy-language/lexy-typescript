import type {INode} from "./node";
import type {IParseLineContext} from "../parser/context/parseLineContext";

import {Node} from "./node";
import {SourceReference} from "./sourceReference";
import {NodeReference} from "./nodeReference";

export function instanceOfParsableNode(object: any): object is IParsableNode {
   return object?.isParsableNode == true;
}

export function asParsableNode(object: any): IParsableNode | null {
   return instanceOfParsableNode(object) ? object as IParsableNode : null;
}

export interface IParsableNode extends INode {
   isParsableNode: boolean;
   parse(context: IParseLineContext): IParsableNode;
}

export abstract class ParsableNode extends Node implements IParsableNode {

   protected constructor(parentReference: NodeReference, reference: SourceReference) {
      super(parentReference, reference);
   }

   public readonly isParsableNode = true;
   public abstract parse(context: IParseLineContext): IParsableNode;
}
