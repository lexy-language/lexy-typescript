import {VariableReference} from "../../../language/variableReference";
import {CodeWriter} from "../codeWriter";
import {translateParentVariableClassName} from "./translateParentVariableClassName";
import {VariableSource} from "../../../language/variableSource";
import {LexyCodeConstants} from "../lexyCodeConstants";

export function renderVariableReference(variableReference: VariableReference, codeWriter: CodeWriter) {
  if (variableReference == null) throw new Error(`Invalid VariableReference: ${variableReference}`);

  const rootIdentifier = translateParentVariableClassName(variableReference, codeWriter);
  const parent = fromSource(variableReference.source, rootIdentifier);

  codeWriter.write(parent)

  let childReference = variableReference.path;
  while (childReference.hasChildIdentifiers) {
    childReference = childReference.childrenReference();
    codeWriter.write(".")
    codeWriter.write(childReference.rootIdentifier)
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