import {VariableSource} from "../variableSource";
import {IdentifierPath} from "../identifierPath";
import {VariableAccess} from "./variableAccess";
import {VariableReference} from "../variableReference";
import {Type} from "../typeSystem/type";
import {SourceReference} from "../sourceReference";

export class VariableUsage extends VariableReference {
  public readonly access: VariableAccess;

  constructor(reference: SourceReference,
              path: IdentifierPath, parentType: Type | null,
              type: Type | null,
              source: VariableSource,
              access: VariableAccess) {
    super(reference, path, parentType, type, source);
    this.access = access;
  }

  static read(reference: VariableReference) {
    return new VariableUsage(reference.reference, reference.path, reference.componentType, reference.type, reference.source, VariableAccess.Read);
  }

  static write(reference: VariableReference) {
    return new VariableUsage(reference.reference, reference.path, reference.componentType, reference.type, reference.source, VariableAccess.Write);
  }
}

