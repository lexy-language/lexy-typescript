import {VariableReference} from "../language/variableReference";

export type ResultsValue = Date | string | number | boolean | ResultsType;
export type ResultsType = { [key: string]: ResultsValue };

export class FunctionResult {
  private readonly valueObject: ResultsType;

  public get value(): ResultsType {
    return this.valueObject;
  }

  constructor(valueObject: ResultsType) {
    this.valueObject = valueObject;
  }

  public number(name: string): number {
    const value = this.valueObject[name];
    return value as number;
  }

  public getValue(reference: VariableReference): any {
    let currentReference = reference;
    let currentValue: ResultsValue = this.valueObject[reference.parentIdentifier];
    while (currentReference.hasChildIdentifiers) {
      currentReference = currentReference.childrenReference();
      currentValue = (currentValue as ResultsType)[currentReference.parentIdentifier];
    }

    return currentValue;
  }
}