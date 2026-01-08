import {VariableType} from "../variableTypes/variableType";
import {VariableSource} from "../variableSource";
import {VariableAccess} from "./variableAccess";
import {VariableUsage} from "./variableUsage";
import {IdentifierPath} from "../identifierPath";
import {GeneratedType} from "../variableTypes/generatedType";
import {Assert} from "../../infrastructure/assert";

export class Mapping {
   public variableName: string
   public variableType: VariableType
   public variableSource: VariableSource

   constructor(variableName: string, variableType: VariableType, variableSource: VariableSource) {
     this.variableName = variableName;
     this.variableType = variableType;
     this.variableSource = variableSource;
   }
}

export function mapToUsedVariable(access: VariableAccess): (mapping: Mapping) => VariableUsage {
  return mapping => {
    const variablePath = IdentifierPath.parseString(mapping.variableName);
    return new VariableUsage(variablePath, null, mapping.variableType, mapping.variableSource, access);
  };
}

export class VariablesMapping  {

  private readonly mapping: ReadonlyArray<Mapping> = [];

  public readonly mappingType: GeneratedType;
  public readonly values: ReadonlyArray<Mapping>;

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