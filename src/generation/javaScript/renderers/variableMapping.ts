import {CodeWriter} from "../codeWriter";
import {LexyCodeConstants} from "../lexyCodeConstants";
import {VariableSource} from "../../../language/variableSource";
import {Mapping} from "../../../language/expressions/mapping";

export function renderVariableMappingVariableSyntax(mapping: Mapping, codeWriter: CodeWriter) {
  if (mapping.variableSource == VariableSource.Code) {
    codeWriter.write(mapping.variableName);
  } else  if (mapping.variableSource == VariableSource.Results) {
    codeWriter.write(`${LexyCodeConstants.resultsVariable}.${mapping.variableName}`);
  } else  if (mapping.variableSource == VariableSource.Parameters) {
    codeWriter.write(`${LexyCodeConstants.parameterVariable}.${mapping.variableName}`);
  } else {
    throw new Error(`Invalid source: ${mapping.variableSource}`)
  }
}