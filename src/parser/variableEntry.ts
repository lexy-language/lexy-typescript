import {VariableSource} from "../language/variableSource"
import {Type} from "../language/typeSystem/type"

export class VariableEntry {
  public type: Type | null;
  public variableSource: VariableSource;

  constructor(type: Type | null, variableSource: VariableSource) {
    this.type = type;
    this.variableSource = variableSource;
   }
}
