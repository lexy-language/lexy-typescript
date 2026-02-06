import {Assert} from "../../infrastructure/assert";
import {SignatureParameter} from "./signatureParameter";

export class Signature {

   public readonly name: string;
   public readonly parameters: SignatureParameter[] = [];

   constructor(name: string, parameters: SignatureParameter[])  {
      this.name = Assert.notNull(name, "name");
      this.parameters = Assert.notNull(parameters, "parameters");
   }

   public toString(): string {
      const builder = [this.name + ": "];
      for (const parameter of this.parameters) {
         builder.push(parameter.toString());
      }
      return builder.join("");
   }
}
