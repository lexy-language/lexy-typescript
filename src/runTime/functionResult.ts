import {VariablePath} from "../language/variablePath";
import {ExecutionLogEntry} from "./executionLogEntry";

export type ResultsValue = Date | string | number | boolean | ResultsType;
export type ResultsType = { [key: string]: ResultsValue };

export class FunctionResult {
  private readonly valueObject: ResultsType;
  private readonly loggingValue: ReadonlyArray<ExecutionLogEntry>;

  public get value(): ResultsType {
    return this.valueObject;
  }

  public get logging(): ReadonlyArray<ExecutionLogEntry> {
    return this.loggingValue;
  }

  constructor(valueObject: ResultsType, logging: ReadonlyArray<ExecutionLogEntry>) {
    this.valueObject = valueObject;
    this.loggingValue = logging;
  }

  public number(name: string): number {
    const value = this.valueObject[name];
    return value as number;
  }

  public getValue(reference: VariablePath): any {
    let currentReference = reference;
    let currentValue: ResultsValue = this.valueObject[reference.parentIdentifier];
    while (currentReference.hasChildIdentifiers) {
      currentReference = currentReference.childrenReference();
      currentValue = (currentValue as ResultsType)[currentReference.parentIdentifier];
    }

    return currentValue;
  }
}