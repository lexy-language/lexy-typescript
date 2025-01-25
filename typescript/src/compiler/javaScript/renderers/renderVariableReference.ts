import {VariableReference} from "../../../language/variableReference";
import {CodeWriter} from "../writers/codeWriter";
import {translateParentVariableClassName} from "./translateParentVariableClassName";
import {VariableSource} from "../../../language/variableSource";
import {LexyCodeConstants} from "../lexyCodeConstants";

export function renderVariableReference(variableReference: VariableReference, codeWriter: CodeWriter) {
  if (variableReference == null) throw new Error(`Invalid VariableReference: ${variableReference}`);

  const parentIdentifier = translateParentVariableClassName(variableReference, codeWriter);
  const parent = fromSource(variableReference.source, parentIdentifier);

  codeWriter.write(parent)

  let childReference = variableReference.path;
  while (childReference.hasChildIdentifiers) {
    childReference = childReference.childrenReference();
    codeWriter.write(".")
    codeWriter.write(childReference.parentIdentifier)
  }
}

function fromSource(source: VariableSource, name: string): string {
  switch (source) {
    case VariableSource.Parameters:
      return `${LexyCodeConstants.parameterVariable}.${name}`;

    case VariableSource.Results:
      return `${LexyCodeConstants.resultsVariable}.${name}`;

    case VariableSource.Code:
    case VariableSource.Type:
      return name;

    case VariableSource.Unknown:
    default:
      throw new Error(`source: {source}`);
  }
}