import type {IValidationContext} from "../../../parser/context/validationContext";

import {Expression} from "../../expressions/expression";
import {SourceReference} from "../../sourceReference";
import {Type} from "../type";
import {ValidateMemberFunctionArgumentsResult} from "../functions/validateMemberFunctionArgumentsResult";
import {IObjectMember, ObjectMemberKind} from "./objectMember";

export function instanceOfObjectFunction(object: any): object is ObjectFunction {
  return object?.kind == ObjectMemberKind.Function;
}

export function asObjectFunction(object: any): ObjectFunction | null {
  return instanceOfObjectFunction(object) ? object as ObjectFunction : null;
}

export interface IObjectFunction {
  validateArguments(context: IValidationContext, args: ReadonlyArray<Expression>, reference: SourceReference): ValidateMemberFunctionArgumentsResult;
  getResultsType(args: ReadonlyArray<Expression>): Type | null;
}

export abstract class ObjectFunction implements IObjectMember, IObjectFunction {

  public kind = ObjectMemberKind.Function;
  public name: string;
  public type: Type;

  public constructor(name: string, type: Type) {
    this.name = name;
    this.type = type;
  }

  public abstract validateArguments(context: IValidationContext,
    args: ReadonlyArray<Expression>,
    reference: SourceReference): ValidateMemberFunctionArgumentsResult;

  public abstract getResultsType(args: ReadonlyArray<Expression>): Type | null;
}

