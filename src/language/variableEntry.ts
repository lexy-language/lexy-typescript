import {Type} from "./typeSystem/type";
import {VariableSource} from "./variableSource";
import {SourceReference} from "./sourceReference";

export class VariableEntry {

  public readonly name: string;
  public readonly type: Type | null;
  public readonly variableSource: VariableSource;
  public readonly reference: SourceReference | null;

  constructor(name: string, type: Type, variableSource: VariableSource, reference: SourceReference | null = null) {
    this.name = name;
    this.type = type;
    this.variableSource = variableSource;
    this.reference = reference;
  }
}
