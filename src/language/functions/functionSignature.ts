import {Type} from "../typeSystem/type";

export class FunctionSignature {

  public parametersTypes: ReadonlyArray<Type | null>;
  public resultsType: Type | null;

  constructor(parametersTypes: ReadonlyArray<Type | null>, resultsType: Type | null) {
    this.parametersTypes = parametersTypes;
    this.resultsType = resultsType;
  }

  public matches(argumentTypes: ReadonlyArray<Type | null>): boolean {

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
