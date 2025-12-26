import {IParsableNode} from "./parsableNode";

export class ParsableNodeArray {

   private values:Array<IParsableNode | null> = new Array<IParsableNode | null>(8);

   constructor(componentNode: IParsableNode) {
     this.values[0] = componentNode;
   }

   public get(indent: number): IParsableNode | null {
     let node = this.values[indent];
     for (let index = indent + 1; index < this.values.length; index++) {
       if (this.values[index] == null) break;

       this.values[index] = null;
     }

     return node;
   }

   public set(indent: number, node: IParsableNode): void {
     if (indent >= this.values.length) {
      this.resize(this.values.length * 2);
     }

     this.values[indent] = node;
   }

   private resize(size: number) {
    var delta = this.values.length - size;
    while (delta++ < 0) this.values.push(null);
  }
}
