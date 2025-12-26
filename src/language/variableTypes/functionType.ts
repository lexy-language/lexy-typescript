import type {IValidationContext} from "../../parser/validationContext";

import {TypeWithMembers} from "./typeWithMembers";
import {VariableType} from "./variableType";
import {Function} from "../functions/function";
import {VariableTypeName} from "./variableTypeName";
import {ComplexType} from "./complexType";
import {IComponentNodeList} from "../componentNodeList";

export function instanceOfFunctionType(object: any): object is FunctionType {
  return object?.variableTypeName == VariableTypeName.EnumType;
}

export function asFunctionType(object: any): FunctionType | null {
  return instanceOfFunctionType(object) ? object as FunctionType : null;
}

export class FunctionType extends TypeWithMembers {

  public readonly variableTypeName = VariableTypeName.FunctionType;

  public type: string;
  public functionValue: Function;

  constructor(type: string, functionValue: Function) {
    super();
    this.type = type;
    this.functionValue = functionValue;
  }

  public override equals(other: VariableType | null): boolean {
    return other != null && instanceOfFunctionType(other) && this.type == other.type;
  }

  public toString(): string {
    return this.type;
  }

  public override memberType(name: string, componentNodes: IComponentNodeList): VariableType | null {
    if (name == Function.parameterName) return this.functionParametersType(componentNodes);
    if (name == Function.resultsName) return this.functionResultsType(componentNodes);
    return null;
  }

  private functionParametersType(componentNodes: IComponentNodeList): ComplexType | null {
    const resultsType = componentNodes.getFunction(this.type)?.getParametersType();
    return !!resultsType ? resultsType : null;
  }

  private functionResultsType(componentNodes: IComponentNodeList): ComplexType | null {
    const resultsType = componentNodes.getFunction(this.type)?.getResultsType();
    return !!resultsType ? resultsType : null;
  }
}
