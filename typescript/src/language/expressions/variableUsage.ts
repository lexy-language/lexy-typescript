import {VariableSource} from "../variableSource";
import {VariablePath} from "../variablePath";
import {VariableAccess} from "./variableAccess";
import {VariableReference} from "../variableReference";
import {VariableType} from "../variableTypes/variableType";

export class VariableUsage extends VariableReference {
  public readonly access: VariableAccess;

  constructor(path: VariablePath, parentVariableType: VariableType | null,
              variableType: VariableType | null, source: VariableSource, access: VariableAccess) {
    super(path, parentVariableType, variableType, source);
    this.access = access;
  }

  static read(reference: VariableReference) {
    return new VariableUsage(reference.path, reference.rootType, reference.variableType, reference.source, VariableAccess.Read);
  }

  static write(reference: VariableReference) {
    return new VariableUsage(reference.path, reference.rootType, reference.variableType, reference.source, VariableAccess.Write);
  }
}

