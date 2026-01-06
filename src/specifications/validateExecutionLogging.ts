import type {LogVariable, LogVariables} from "../runTime/executionContext";
import type {IAssignmentDefinition} from "../language/scenarios/assignmentDefinition";

import {ExecutionLog} from "../language/scenarios/executionLog";
import {asObjectAssignmentDefinition} from "../language/scenarios/objectAssignmentDefinition";
import {asAssignmentDefinition} from "../language/scenarios/assignmentDefinition";
import {ExecutionLogEntry} from "../runTime/executionLogEntry";

function validateEntry(indent: number, actualEntry: ExecutionLogEntry | null, expectedEntry: ExecutionLog | null, errors: string[]) {

  function addLog(message: string) {
    errors.push(" ".repeat(indent * 2) + message);
  }

  function getName(expectedVariable: IAssignmentDefinition, nested: boolean) {
    const object = asObjectAssignmentDefinition(expectedVariable);
    if (object != null) {
      return nested ? object.variable.lastPart() : object.variable.fullPath();
    }

    const assignmentDefinition = asAssignmentDefinition(expectedVariable);
    return nested ? assignmentDefinition?.variable.lastPart() : assignmentDefinition?.variable.fullPath();
  }

  function validateEntryMessage(actualEntry: ExecutionLogEntry, expectedEntry: ExecutionLog) {
    if (actualEntry.message != expectedEntry.message) {
      const message = "Invalid log:";
      addLog(message);
      addLog(`  Expected: '${expectedEntry.message}'`);
      addLog(`  Actual: '${actualEntry.message}'`);
    }
  }

  function validateVariable(actualValue: LogVariable, expectedVariable: IAssignmentDefinition) {
    function notEqual(expectedValue: any, actualValue: any) {
      if (expectedValue instanceof Date) {
        if (!(actualValue instanceof Date)) {
          return false;
        }
        return (expectedValue as Date).toISOString() != (actualValue as Date).toISOString();
      }
      if (toString.call(actualValue) === '[object Decimal]') {
        return !actualValue.equals(expectedValue);
      }
      return expectedValue != actualValue;
    }

    function validateValueVariable(actualValue: LogVariable, expectedVariable: IAssignmentDefinition) {
      const definition = asAssignmentDefinition(expectedVariable);
      const expected = definition?.variable.fullPath();
      const expectedValue = definition?.constantValue.value;
      if (notEqual(expectedValue, actualValue)) {
        addLog(`${expectedVariable.reference} - Invalid variable value: '${expected}'`);
        addLog(`  Expected: '${expectedValue}'`);
        addLog(`  Actual: '${actualValue}'`);
      }
    }

    const object = asObjectAssignmentDefinition(expectedVariable);
    if (object != null) {
      validateVariables(true, actualValue as LogVariables, null, object.assignments)
    } else {
      validateValueVariable(actualValue, expectedVariable);
    }
  }

  function getActualValue(name: string | undefined, actualParameters: LogVariables | null, actualResults: LogVariables | null) {
    if (!name) return null;
    if (actualParameters != null && name in actualParameters) {
      return actualParameters[name];
    }
    return (actualResults != null && name in actualResults) ? actualResults[name] : null;
  }

  function validateVariables(nested: boolean, actualParameters: LogVariables | null, actualResults: LogVariables | null, expectedEntries: ReadonlyArray<IAssignmentDefinition>) {
    for (let index = 0 ; index < expectedEntries.length ; index++) {
      const expectedVariable = expectedEntries[index];
      const name = getName(expectedVariable, nested);
      const actualVariable = getActualValue(name, actualParameters, actualResults);
      if (actualVariable == null) {
        addLog(`${expectedVariable.reference} - Variable not found: '${name}'`);
      } else {
        validateVariable(actualVariable, expectedVariable);
      }
    }
  }

  if (actualEntry == null && expectedEntry != null) {
    addLog(`${expectedEntry.reference} - Not found: '${expectedEntry.message}'`);
  } else if (actualEntry != null && expectedEntry == null) {
    addLog(`Log not expected: '${actualEntry.message}'`);
  } else if (actualEntry != null && expectedEntry != null) {
    validateEntryMessage(actualEntry, expectedEntry);
    validateEntries(indent + 1, actualEntry.entries, expectedEntry.entries, errors);
    validateVariables(false, actualEntry.readVariables, actualEntry.writeVariables, expectedEntry.assignments);
  }
}

function validateEntries(indent: number, actual: ReadonlyArray<ExecutionLogEntry>, expected: ReadonlyArray<ExecutionLog>, errors: string[]) {
  const max = Math.max(actual.length, expected.length);
  for (let index = 0 ; index < max ; index++) {
    const actualEntry = index < actual.length ? actual[index] : null;
    const expectedEntry = index < expected.length ? expected[index] : null;
    validateEntry(indent, actualEntry, expectedEntry, errors);
  }
}

export default function validateExecutionLogging(actual: ReadonlyArray<ExecutionLogEntry>, expected: ReadonlyArray<ExecutionLog>): Array<string> | null {
  const errors = new Array<string>();
  validateEntries(0, actual, expected, errors);
  return errors.length > 0 ? errors : null;
}