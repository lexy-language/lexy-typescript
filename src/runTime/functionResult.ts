import {VariablePath} from "../language/variablePath";
import {ExecutionLogEntry} from "./executionLogEntry";
import Decimal from "decimal.js";

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

  public string(name: string): string {
    const value = this.valueObject[name];
    return value as string;
  }

  public object(name: string): any {
    return this.valueObject[name];
  }

  public getValue(reference: VariablePath): any {
    let currentReference = reference;
    let currentValue: ResultsValue = this.valueObject[reference.parentIdentifier];
    while (currentReference.hasChildIdentifiers) {
      currentReference = currentReference.childrenReference();
      if (currentValue == null) {
        throw new Error(`Can't get variable: '${reference}'` )
      }
      currentValue = (currentValue as ResultsType)[currentReference.parentIdentifier];
    }

    return currentValue;
  }
}