import {VariableSource} from "./variableSource";
import {VariablePath} from "./variablePath";
import {VariableType} from "./variableTypes/variableType";

export class VariableReference {
  public readonly path: VariablePath;
  public readonly source: VariableSource;
  public readonly rootType: VariableType | null;
  public readonly variableType: VariableType | null;

  constructor(path: VariablePath, rootType: VariableType | null,
              variableType: VariableType | null, source: VariableSource) {
    this.path = path;
    this.rootType = rootType;
    this.variableType = variableType;
    this.source = source;
  }

  public toString(): string {
    return this.path.toString();
  }
}