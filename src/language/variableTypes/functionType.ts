import type {IComponentNodeList} from "../componentNodeList";

import {ObjectType} from "./objectType";
import {VariableType} from "./variableType";
import {Function} from "../functions/function";
import {VariableTypeName} from "./variableTypeName";
import {GeneratedType} from "./generatedType";
import {IObjectTypeFunction} from "./objectTypeFunction";
import {IObjectTypeVariable} from "./objectTypeVariable";

export function instanceOfFunctionType(object: any): object is FunctionType {
  return object?.variableTypeName == VariableTypeName.EnumType;
}

export function asFunctionType(object: any): FunctionType | null {
  return instanceOfFunctionType(object) ? object as FunctionType : null;
}

export class FunctionType extends ObjectType {

  public readonly variableTypeName = VariableTypeName.FunctionType;

  public type: string;
  public functionValue: Function;

  constructor(type: string, functionValue: Function) {
    super();
    this.type = type;
    this.functionValue = functionValue;
  }

  public override getVariable(name: string): IObjectTypeVariable | null {
    return null;
  }

  public override getFunction(name: string): IObjectTypeFunction | null {
    return null;
  }

  public override memberType(name: string, componentNodes: IComponentNodeList): VariableType | null {
    if (name == Function.parameterName) return this.functionParametersType(componentNodes);
    if (name == Function.resultsName) return this.functionResultsType(componentNodes);
    return null;
  }


  public override isAssignableFrom(type: VariableType): boolean {
    return this.equals(type);
  }

  public override equals(other: VariableType | null): boolean {
    return other != null && instanceOfFunctionType(other) && this.type == other.type;
  }

  public toString(): string {
    return this.type;
  }
  private functionParametersType(componentNodes: IComponentNodeList): GeneratedType | null {
    const resultsType = componentNodes.getFunction(this.type)?.getParametersType();
    return !!resultsType ? resultsType : null;
  }

  private functionResultsType(componentNodes: IComponentNodeList): GeneratedType | null {
    const resultsType = componentNodes.getFunction(this.type)?.getResultsType();
    return !!resultsType ? resultsType : null;
  }
}
