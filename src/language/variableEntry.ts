import {Type} from "./typeSystem/type";
import {VariableSource} from "./variableSource";
import {SourceReference} from "./sourceReference";
import {instanceOfEnumType} from "./typeSystem/enumType";
import {instanceOfGeneratedType} from "./typeSystem/objects/generatedType";

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

  public toString(): string | null {
    switch (this.variableSource) {
      case VariableSource.Parameters:
        return `parameter: ${this.type}`;
      case VariableSource.Results:
        return `result: ${this.type}`;
      case VariableSource.Code:
        return `variable: ${this.type}`;
      case VariableSource.Type:
        return this.typeSymbol();
      default:
        throw new Error(`VariableEntry: ${this.variableSource}`)
    }
  }

  private typeSymbol(): string {
    if (instanceOfEnumType(this.type)) {
      return `enum member: ${this.type}`;
    }
    return instanceOfGeneratedType(this.type)
      ? `type: ${this.type}`
      : `variable: ${this.type}`;
  }
}
