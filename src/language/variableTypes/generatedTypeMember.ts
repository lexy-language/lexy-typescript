import {VariableType} from "./variableType";

export class GeneratedTypeMember {

   public readonly name: string;
   public readonly type: VariableType | null;

   constructor(name: string, type: VariableType | null) {
     this.name = name;
     this.type = type;
   }
}
