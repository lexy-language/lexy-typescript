import {VariableSource} from "./variableSource";
import {IdentifierPath} from "./identifierPath";
import {VariableType} from "./variableTypes/variableType";

export class VariableReference {
  public readonly path: IdentifierPath;
  public readonly source: VariableSource;
  public readonly componentType: VariableType | null;
  public readonly variableType: VariableType | null;

  constructor(path: IdentifierPath, componentType: VariableType | null,
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