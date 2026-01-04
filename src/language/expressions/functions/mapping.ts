import {VariableType} from "../../variableTypes/variableType";
import {VariableSource} from "../../variableSource";
import {VariableAccess} from "../variableAccess";
import {VariableUsage} from "../variableUsage";
import {IdentifierPath} from "../../identifierPath";

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
