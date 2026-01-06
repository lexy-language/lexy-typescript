import {VariableType} from "../variableTypes/variableType";

export class FunctionSignature {

  public parametersTypes: ReadonlyArray<VariableType | null>;
  public resultsType: VariableType | null;

  constructor(parametersTypes: ReadonlyArray<VariableType | null>, resultsType: VariableType | null) {
    this.parametersTypes = parametersTypes;
    this.resultsType = resultsType;
  }

  public matches(argumentTypes: ReadonlyArray<VariableType | null>): boolean {

    if (argumentTypes.length != this.parametersTypes.length) return false;

    for (let index = 0; index < this.parametersTypes.length; index++) {
      let parametersType = this.parametersTypes[index];
      let argumentType = argumentTypes[index];

      if (parametersType == null || argumentType == null) {
        return false;
      }

      if (!parametersType.isAssignableFrom(argumentType)) {
        return false;
      }
    }

    return true;
  }
}