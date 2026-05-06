import {Type} from "../typeSystem/type";
import {VariableSource} from "../variableSource";
import {VariableAccess} from "./variableAccess";
import {VariableUsage} from "./variableUsage";
import {IdentifierPath} from "../identifierPath";
import {GeneratedType} from "../typeSystem/objects/generatedType";
import {Assert} from "../../infrastructure/assert";
import {SourceReference} from "../sourceReference";

export class Mapping {

  public reference: SourceReference;

  public variableName: string;
  public type: Type;
  public variableSource: VariableSource;

  constructor(reference: SourceReference, variableName: string, type: Type, variableSource: VariableSource) {
    this.reference = reference;
    this.variableName = variableName;
    this.type = type;
    this.variableSource = variableSource;
  }
}

export function mapToUsedVariable(access: VariableAccess): (mapping: Mapping) => VariableUsage {
  return mapping => {
    const identifierPath = IdentifierPath.parseString(mapping.variableName);
    return new VariableUsage(mapping.reference, identifierPath, null, mapping.type, mapping.variableSource, access);
  };
}

export class VariablesMapping  {

  private readonly mapping: ReadonlyArray<Mapping> = [];

  public readonly mappingType: GeneratedType;
  public readonly values: readonly Mapping[];

  constructor(mappingType: GeneratedType, mapping: ReadonlyArray<Mapping>) {
    this.values = mapping;
    this.mappingType = Assert.notNull(mappingType, "generatedType");
    this.mapping = Assert.notNull(mapping, "mapping");
  }

  public uedVariables(access: VariableAccess): ReadonlyArray<VariableUsage> {
    const usedVariables = mapToUsedVariable(access);
    return this.mapping.map(usedVariables);
  }
}
