import {VariableSource} from "./variableSource";
import {IdentifierPath} from "./identifierPath";
import {Type} from "./typeSystem/type";

export class VariableReference {
  public readonly path: IdentifierPath;
  public readonly source: VariableSource;
  public readonly componentType: Type | null;
  public readonly type: Type | null;

  constructor(path: IdentifierPath, componentType: Type | null,
              type: Type | null, source: VariableSource) {
    this.path = path;
    this.componentType = componentType;
    this.type = type;
    this.source = source;
  }

  public toString(): string {
    return this.path.toString();
  }
}
