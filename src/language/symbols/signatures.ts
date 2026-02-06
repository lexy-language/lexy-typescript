import {Assert} from "../../infrastructure/assert";
import {Signature} from "./signature";

export class Signatures {

   public readonly values: Signature[];

   constructor(values: Signature[])  {
      this.values = Assert.notNull(values, "values");
   }

   public toString(): string {
      const builder: string[] = [];
      for (const signature of this.values) {
         builder.push("- " + signature.toString());
      }
      return builder.join("");
   }
}
