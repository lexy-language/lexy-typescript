import type {IValidationContext} from "../../parser/validationContext";
import {Expression} from "../expressions/expression";
import {SourceReference} from "../../parser/sourceReference";
import {VariableType} from "../variableTypes/variableType";
import {ValidateInstanceFunctionArgumentsResult} from "./validateInstanceFunctionArgumentsResult";

export interface IInstanceFunction {
  validateArguments(context: IValidationContext, args: ReadonlyArray<Expression>, reference: SourceReference): ValidateInstanceFunctionArgumentsResult;
  getResultsType(args: ReadonlyArray<Expression>): VariableType | null;
}

