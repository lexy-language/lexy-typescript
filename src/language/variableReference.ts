import {VariableSource} from "./variableSource";
import {VariablePath} from "./variablePath";
import {VariableType} from "./variableTypes/variableType";

export class VariableReference {
  public readonly path: VariablePath;
  public readonly source: VariableSource;
  public readonly componentType: VariableType | null;
  public readonly variableType: VariableType | null;

  constructor(path: VariablePath, componentType: VariableType | null,
              variableType: VariableType | null, source: VariableSource) {
    this.path = path;
    this.componentType = componentType;
    this.variableType = variableType;
    this.source = source;
  }

  public toString(): string {
    return this.path.toString();
  }
}