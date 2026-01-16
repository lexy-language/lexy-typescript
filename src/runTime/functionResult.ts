import {IdentifierPath} from "../language/identifierPath";
import {Function} from "../language/functions/function";
import {ExecutionLogEntry} from "./executionLogEntry";

export type ResultsValue = Date | string | number | boolean | ResultsType;
export type ResultsType = { [key: string]: ResultsValue };

export class FunctionResult {

  private readonly functionNode: Function;
  private readonly valueObject: ResultsType;
  private readonly loggingValue: ReadonlyArray<ExecutionLogEntry>;

  public get value(): ResultsType {
    return this.valueObject;
  }

  public get logging(): ReadonlyArray<ExecutionLogEntry> {
    return this.loggingValue;
  }

  constructor(functionNode: Function, valueObject: ResultsType, logging: ReadonlyArray<ExecutionLogEntry>) {
    this.functionNode = functionNode;
    this.valueObject = valueObject;
    this.loggingValue = logging;
  }

  public number(name: string): number {
    const errors: string[] = [];
    const path = IdentifierPath.parseString(name);
    const value = this.getValue(path, errors);
    if (errors.length > 0) {
      throw new Error(errors.join("/n"));
    }
    return value as number;
  }

  public string(name: string): string {
    const errors: string[] = [];
    const path = IdentifierPath.parseString(name);
    const value = this.getValue(path, errors);
    if (errors.length > 0) {
      throw new Error(errors.join("/n"));
    }
    return value as string;
  }

  public object(name: string): any {
    const errors: string[] = [];
    const path = IdentifierPath.parseString(name);
    const value = this.getValue(path, errors);
    if (errors.length > 0) {
      throw new Error(errors.join("/n"));
    }
    return value;
  }

  public getValue(reference: IdentifierPath, validationResult: Array<string>): any {

    let currentReference = reference;
    let currentValue: ResultsValue = this.functionNode.results.variables.length == 1
      ? this.valueObject
      : this.valueObject[reference.rootIdentifier];

    while (currentReference.hasChildIdentifiers) {
      currentReference = currentReference.childrenReference();
      if (currentValue == null) {
        validationResult.push(`Can't get variable: '${reference}'. Values: '${JSON.stringify(this.valueObject, null,  4)}'`);
        return null;
      }
      currentValue = (currentValue as ResultsType)[currentReference.rootIdentifier];
    }

    return currentValue;
  }
}
