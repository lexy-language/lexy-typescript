import type {IValidationContext} from "../parser/validationContext";
import type {IObjectTypeFunction} from "../language/variableTypes/objectTypeFunction";

import {SourceReference} from "../parser/sourceReference";
import {Expression} from "../language/expressions/expression";

import {VariableType} from "../language/variableTypes/variableType";
import {PrimitiveType} from "../language/variableTypes/primitiveType";
import {LibraryFunctionInfo} from "../runTime/libraries/libraryRuntime";
import {LibraryFunctionCall} from "./libraryFunctionCall";
import {
  newValidateMemberFunctionArgumentsFailed,
  newValidateMemberFunctionArgumentsSuccess, ValidateMemberFunctionArgumentsResult
} from "../language/variableTypes/functions/validateMemberFunctionArgumentsResult";

export class LibraryFunction implements IObjectTypeFunction {

  private readonly returnType: VariableType ;
  private readonly parameterTypes: VariableType[];

  public libraryName: string;
  public name: string;

  private constructor(libraryName: string, name: string,  returnType: VariableType, parameterTypes: VariableType[]) {
    this.returnType = returnType;
    this.parameterTypes = parameterTypes;
    this.libraryName = libraryName;
    this.name = name;
  }

  public validateArguments(context: IValidationContext, args: ReadonlyArray<Expression>, reference: SourceReference): ValidateMemberFunctionArgumentsResult {
    if (args.length != this.parameterTypes.length) {
      context.logger.fail(reference, `Invalid number of function arguments: '${this.name}. Expected: '${this.parameterTypes.length}' Actual: '${args.length}'. `);
      return newValidateMemberFunctionArgumentsFailed();
    }

    let failed = false;
    for (let index = 0; index < args.length; index++) {
      if (!this.validateArgument(reference, context, args, index)) {
        failed = true;
      }
    }

    return failed
      ? newValidateMemberFunctionArgumentsFailed()
      : newValidateMemberFunctionArgumentsSuccess(new LibraryFunctionCall(this.libraryName, this.name, this.returnType));
  }

  public getResultsType(args: ReadonlyArray<Expression>): VariableType {
    return this.returnType;
  }

  private validateArgument(reference: SourceReference, context: IValidationContext, args: ReadonlyArray<Expression>, index: number): boolean {

    const argument = args[index];
    const argumentType = argument.deriveType(context);
    const parametersType = this.parameterTypes[index];

    if (argumentType == null || !argumentType.equals(parametersType)) {
      context.logger.fail(reference, `Invalid function argument: '${this.name}'. Argument should be of type function parameters. Use new(Function) of fill(Function) to create an variable of the function result type.`);
      return false;
    }
    return true;
  }

  public static build(libraryName: string, name: string, functionInfo: LibraryFunctionInfo):LibraryFunction {
    const parameterTypes = functionInfo.args.map(value => PrimitiveType.parse(value));
    const returnType = PrimitiveType.parse(functionInfo.returnType);
    return new LibraryFunction(libraryName, name, returnType, parameterTypes);
  }
}