import {any, firstOrDefault} from "../infrastructure/enumerableExtensions";
import {Parameters} from "../language/scenarios/parameters";
import {FunctionParameters} from "../language/functions/functionParameters";
import {asAssignmentDefinition, AssignmentDefinition} from "../language/scenarios/assignmentDefinition";
import {Assert} from "../infrastructure/assert";
import {Function} from "../language/functions/function";
import {VariablePathParser} from "../language/scenarios/variablePathParser";
import {VariablePath} from "../language/variablePath";
import {ValidationTableHeader} from "../language/scenarios/validationTableHeader";
import {ValidationTableRow} from "../language/scenarios/validationTableRow";
import {ValidationTableValue} from "../language/scenarios/validationTableValue";
import {ValidationColumnHeader} from "../language/scenarios/validationColumnHeader";

type ValueObject = { [key: string]: any};

export function getScenarioParameterValues(functionNode: Function,
                                           scenarioParameters: Parameters | null,
                                           functionParameters: FunctionParameters | null): ValueObject {
  if (scenarioParameters == null || functionParameters == null) return {};

  const result = {}
  setParameters(functionNode, scenarioParameters.allAssignments(), functionParameters, result);
  return result;
}

function setParameters(functionNode: Function,
                       parameters: ReadonlyArray<AssignmentDefinition>, 
                       functionParameters: FunctionParameters, 
                       result: ValueObject) {
  for (const parameter of parameters) {
    setParameter(functionNode, functionParameters, parameter, result);
  }
}

function setParameter(functionNode: Function,
                      functionParameters: FunctionParameters,
                      parameter: AssignmentDefinition,
                      result: ValueObject) {

  const assignmentDefinition = Assert.notNull(asAssignmentDefinition(parameter), "assignmentDefinition");
  let type = firstOrDefault(functionParameters.variables, variable => variable.name == assignmentDefinition.variable.parentIdentifier);

  if (type == null) {
    throw new Error(`Function '${functionNode?.name?.value}' parameter '${assignmentDefinition.variable.parentIdentifier}' not found.`);
  }

  if (assignmentDefinition.variableType == null) throw new Error("parameter.variableType is null")
  const value = getValue(assignmentDefinition);

  setValueObjectProperty(result, assignmentDefinition.variable, value);
}

function getValue(assignmentDefinition: AssignmentDefinition) {
  return assignmentDefinition.constantValue.value;
}

export function getTableRowValues(functionNode: Function,
                                  header: ValidationTableHeader,
                                  row: ValidationTableRow): ValueObject {
  const result = {}
  setRowParameters(functionNode, header, row, result);
  return result;
}

function setRowParameters(functionNode: Function,
                          header: ValidationTableHeader,
                          row: ValidationTableRow,
                          result: ValueObject) {
  for (let index = 0; index < row.values.length; index++) {
    const column = header.getColumnByIndex(index);
    const value = row.values[index];
    if (column == null) continue;
    setRowParameter(functionNode, column, value, result);
  }
}

function setRowParameter(functionNode: Function,
                         column: ValidationColumnHeader,
                         value: ValidationTableValue,
                         result: ValueObject) {

  const variableReference = VariablePathParser.parseString(column.name);
  if (!isParameter(functionNode, variableReference)) return;
  setValueObjectProperty(result, variableReference, value.getValue());
}

function setValueObjectProperty(result: any, variableReference: VariablePath, value: object | null) : void {
  let valueObject = result;
  while (variableReference.hasChildIdentifiers) {
    if (!valueObject[variableReference.parentIdentifier]) {
      valueObject[variableReference.parentIdentifier] = {};
    }
    valueObject = valueObject[variableReference.parentIdentifier];
    variableReference = variableReference.childrenReference();
  }
  valueObject[variableReference.parentIdentifier] = value;
}

function isParameter(functionNode: Function, path: VariablePath) {
  if (functionNode?.parameters == null) return false;
  return any(functionNode.parameters.variables, parameter => parameter.name == path.parentIdentifier);
}