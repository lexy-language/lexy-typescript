import type {IValidationContext} from "../../parser/validationContext";
import {Expression} from "../expressions/expression";
import {SourceReference} from "../../parser/sourceReference";
import {VariableType} from "./variableType";
import {ValidateMemberFunctionArgumentsResult} from "./functions/validateMemberFunctionArgumentsResult";

export interface IObjectTypeFunction {
  validateArguments(context: IValidationContext, args: ReadonlyArray<Expression>, reference: SourceReference): ValidateMemberFunctionArgumentsResult;
  getResultsType(args: ReadonlyArray<Expression>): VariableType | null;
}

export abstract class ObjectTypeFunction implements IObjectTypeFunction {

  public abstract validateArguments(context: IValidationContext,
    args: ReadonlyArray<Expression>,
    reference: SourceReference): ValidateMemberFunctionArgumentsResult;

  public abstract getResultsType(args: ReadonlyArray<Expression>): VariableType | null;
}
