import {Assert} from "../../infrastructure/assert";

export class SignatureParameter {

   public readonly name: string;
   public readonly documentation: string;

   constructor(name: string, documentation: string)  {
      this.name = Assert.notNull(name, "name");
      this.documentation = Assert.notNull(documentation, "documentation");
   }

   public toString(): string {
      return this.name + ": " + this.documentation;
   }
}
