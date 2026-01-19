import {ObjectType} from "./objects/objectType";
import {Type} from "./type";
import {Function} from "../functions/function";
import {TypeKind} from "./typeKind";
import {IObjectMember} from "./objects/objectMember";
import {ObjectNestedType} from "./objects/objectNestedType";

export function instanceOfFunctionType(object: any): object is FunctionType {
  return object?.typeKind == TypeKind.EnumType;
}

export function asFunctionType(object: any): FunctionType | null {
  return instanceOfFunctionType(object) ? object as FunctionType : null;
}

export class FunctionType extends ObjectType {

  public readonly typeKind = TypeKind.FunctionType;

  public functionValue: Function;

  constructor(functionValue: Function) {
    super(functionValue.name);
    this.functionValue = functionValue;
  }

  public override isAssignableFrom(type: Type): boolean {
    return this.equals(type);
  }

  public override equals(other: Type | null): boolean {
    return other != null && instanceOfFunctionType(other) && this.name == other.name;
  }

  public toString(): string {
    return this.name;
  }

  protected override createMembers(): IObjectMember[] {
    return [
      new ObjectNestedType(Function.parameterName, this.functionValue.getParametersType()),
      new ObjectNestedType(Function.resultsName, this.functionValue.getResultsType())
    ];
  }
}
