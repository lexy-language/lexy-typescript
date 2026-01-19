import {VariableSource} from "../variableSource";
import {IdentifierPath} from "../identifierPath";
import {VariableAccess} from "./variableAccess";
import {VariableReference} from "../variableReference";
import {Type} from "../typeSystem/type";

export class VariableUsage extends VariableReference {
  public readonly access: VariableAccess;

  constructor(path: IdentifierPath, parentType: Type | null,
              type: Type | null, source: VariableSource, access: VariableAccess) {
    super(path, parentType, type, source);
    this.access = access;
  }

  static read(reference: VariableReference) {
    return new VariableUsage(reference.path, reference.componentType, reference.type, reference.source, VariableAccess.Read);
  }

  static write(reference: VariableReference) {
    return new VariableUsage(reference.path, reference.componentType, reference.type, reference.source, VariableAccess.Write);
  }
}

