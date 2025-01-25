import {TypeWithMembers} from "./typeWithMembers";
import {VariableType} from "./variableType";
import {Function} from "../functions/function";
import {IValidationContext} from "../../parser/validationContext";
import {VariableTypeName} from "./variableTypeName";
import {ComplexType} from "./complexType";

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

  public override memberType(name: string, context: IValidationContext): VariableType | null {
    if (name == Function.parameterName) return this.functionParametersType(context);
    if (name == Function.resultsName) return this.functionResultsType(context);
    return null;
  }

  private functionParametersType(context: IValidationContext): ComplexType | null {
    const resultsType = context.rootNodes.getFunction(this.type)?.getParametersType(context);
    return !!resultsType ? resultsType : null;
  }

  private functionResultsType(context: IValidationContext): ComplexType | null {
    const resultsType = context.rootNodes.getFunction(this.type)?.getResultsType(context);
    return !!resultsType ? resultsType : null;
  }
}
