import type {IValidationContext} from "../../../parser/validationContext";

import {TableFunction} from "./tableFunction";
import {Table} from "../../tables/table";
import {Expression} from "../../expressions/expression";
import {VariableType} from "../variableType";
import {instanceOfMemberAccessExpression} from "../../expressions/memberAccessExpression";
import {SourceReference} from "../../../parser/sourceReference";
import {
    newValidateInstanceFunctionArgumentsFailed, newValidateInstanceFunctionArgumentsSuccess,
    ValidateInstanceFunctionArgumentsResult
} from "../../functions/validateInstanceFunctionArgumentsResult";
import {LookUpRowFunctionCall} from "./lookUpRowFunctionCall";

class OverloadArguments {
    public discriminator: number | null;
    public lookUpValue: number;
    public discriminatorColumnArgument: number | null;
    public defaultDiscriminatorColumn: number | null;
    public searchColumnArgument: number | null;
    public defaultSearchColumn: number;

    constructor(Discriminator: number | null, LookUpValue: number, DiscriminatorColumnArgument: number | null, DefaultDiscriminatorColumn: number | null, SearchColumnArgument: number | null, DefaultSearchColumn: number) {
        this.discriminator = Discriminator;
        this.lookUpValue = LookUpValue;
        this.discriminatorColumnArgument = DiscriminatorColumnArgument;
        this.defaultDiscriminatorColumn = DefaultDiscriminatorColumn;
        this.searchColumnArgument = SearchColumnArgument;
        this.defaultSearchColumn = DefaultSearchColumn;
    }
}

export class LookUpRowFunction extends TableFunction {

    public static readonly functionHelpValue: string = "Arguments: " +
      "TableName.LookUpRow(lookUpValue) " +
      "or TableName.LookUpRow(lookUpValue, Table.SearchColumn)" +
      "or TableName.LookUpRow(discriminator, lookUpValue)" +
      "or TableName.LookUpRow(discriminator, lookUpValue, Table.DiscriminatorColumn, Table.SearchColumn)";

    public static readonly functionName = `LookUpRow`;

    protected override get functionHelp(): string {
        return LookUpRowFunction.functionHelpValue;
    }

    constructor(table: Table){
        super(table);
    }

    public override getResultsType(args: ReadonlyArray<Expression>): VariableType | null {
        return this.table ? this.table.getRowType() : null;
    }

    public override validateArguments(context: IValidationContext, args: ReadonlyArray<Expression>,
                                      reference: SourceReference): ValidateInstanceFunctionArgumentsResult {
        if (!this.validateTable(context, reference)) return newValidateInstanceFunctionArgumentsFailed();

        const overloadArguments = LookUpRowFunction.getArgumentColumns(context, args, reference);
        if (!overloadArguments) return newValidateInstanceFunctionArgumentsFailed()

        const searchColumnHeader = this.getColumn(context, args, overloadArguments.searchColumnArgument, overloadArguments.defaultSearchColumn, reference) ;

        if (searchColumnHeader == null) {
            return newValidateInstanceFunctionArgumentsFailed();
        }

        this.validateColumnValueType(context, args, overloadArguments.lookUpValue, "Search", searchColumnHeader, reference);

        const discriminatorColumnHeader = this.validateDiscriminator(context, args, reference, overloadArguments);
        const discriminatorExpression = overloadArguments.discriminator != null ? args[overloadArguments.discriminator] : null;

        const result = new LookUpRowFunctionCall(
          this.table.name.value,
          args[overloadArguments.lookUpValue],
          discriminatorExpression,
          searchColumnHeader.name,
          discriminatorColumnHeader ? discriminatorColumnHeader.name : null);

        return newValidateInstanceFunctionArgumentsSuccess(result);
    }

    private static getArgumentColumns(context: IValidationContext | null, args: ReadonlyArray<Expression>, reference: SourceReference | null):
      OverloadArguments | null {
        switch (args.length){
            case 1:
                //"table.lookUpRow(lookUpValue) " +
                return new OverloadArguments(null, 0, null, null, null, 0);

            case 2:
                //"table.lookUpRow(lookUpValue, Table.SearchColumn)"
                if (instanceOfMemberAccessExpression(args[1])) {
                    return new OverloadArguments(null, 0, null, null, 1, 0);
                }
                //"table.lookUpRow(discriminator, lookUpValue)"
                return new OverloadArguments(0, 1, null, 0, null, 1);

            case 4:
                //"table.lookUpRow(discriminator, lookUpValue, Table.DiscriminatorColumn, Table.SearchColumn)";
                return new OverloadArguments(0, 1, 2, 0, 3, 1);

            default:
                if (context && reference) {
                    context.logger.fail(reference, `Invalid number of arguments. ${LookUpRowFunction.functionHelpValue}`);
                }
                return null;
        }
    }
}
