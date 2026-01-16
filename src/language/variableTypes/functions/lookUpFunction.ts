import type {IValidationContext} from "../../../parser/validationContext";

import {TableFunction} from "./tableFunction";
import {Table} from "../../tables/table";
import {Expression} from "../../expressions/expression";
import {VariableType} from "../variableType";
import {asMemberAccessExpression, instanceOfMemberAccessExpression} from "../../expressions/memberAccessExpression";
import {SourceReference} from "../../../parser/sourceReference";
import {
    newValidateMemberFunctionArgumentsFailed,
    newValidateMemberFunctionArgumentsSuccess,
    ValidateMemberFunctionArgumentsResult
} from "./validateMemberFunctionArgumentsResult";
import {LookUpFunctionCall} from "./lookUpFunctionCall";

class OverloadArguments {
    public discriminator: number | null;
    public lookUpValue: number;
    public discriminatorColumnArgument: number | null;
    public defaultDiscriminatorColumn: number | null;
    public searchColumnArgument: number | null;
    public defaultSearchColumn: number;
    public resultColumnArgument: number;

    constructor(Discriminator: number | null, LookUpValue: number, DiscriminatorColumnArgument: number | null, DefaultDiscriminatorColumn: number | null, SearchColumnArgument: number | null, DefaultSearchColumn: number, ResultColumnArgument: number) {
        this.discriminator = Discriminator;
        this.lookUpValue = LookUpValue;
        this.discriminatorColumnArgument = DiscriminatorColumnArgument;
        this.defaultDiscriminatorColumn = DefaultDiscriminatorColumn;
        this.searchColumnArgument = SearchColumnArgument;
        this.defaultSearchColumn = DefaultSearchColumn;
        this.resultColumnArgument = ResultColumnArgument;
    }
}

export class LookUpFunction extends TableFunction {

    public static readonly functionHelpValue: string = "Arguments: " +
        "TableName.LookUp(lookUpValue, Table.ResultColumn) " +
        "or TableName.LookUp(lookUpValue, Table.SearchColumn, Table.ResultColumn) " +
        "or TableName.LookUp(discriminator, lookUpValue, Table.ResultColumn) " +
        "or TableName.LookUp(discriminator, lookUpValue, Table.DiscriminatorColumn, Table.SearchColumn, Table.ResultColumn)";

    public static readonly functionName = `LookUp`;

    protected override get functionHelp(): string {
        return LookUpFunction.functionHelpValue;
    }

    constructor(table: Table){
        super(table);
    }

    public override getResultsType(args: ReadonlyArray<Expression>): VariableType | null {

        const overloadArguments = LookUpFunction.getArgumentColumns(null, args, null);
        if (!overloadArguments) return null;

        const argument = args[overloadArguments.resultColumnArgument];
        const columnExpression = asMemberAccessExpression(argument);
        if (columnExpression == null) return null;

        const column = this.table.header?.get(columnExpression.identifierPath);
        return column ? column.type.variableType : null;
    }

    public override validateArguments(context: IValidationContext, args: ReadonlyArray<Expression>,
        reference: SourceReference): ValidateMemberFunctionArgumentsResult {
        if (!this.validateTable(context, reference)) return newValidateMemberFunctionArgumentsFailed();

        const overloadArguments = LookUpFunction.getArgumentColumns(context, args, reference);
        if (!overloadArguments) return newValidateMemberFunctionArgumentsFailed()

        const searchColumnHeader = this.getColumn(context, args, overloadArguments.searchColumnArgument, overloadArguments.defaultSearchColumn, reference) ;
        const resultColumnHeader = this.getColumn(context, args, overloadArguments.resultColumnArgument, null, reference) ;

        if (searchColumnHeader == null || resultColumnHeader == null) {
            return newValidateMemberFunctionArgumentsFailed();
        }

        this.validateColumnValueType(context, args, overloadArguments.lookUpValue, "Search", searchColumnHeader, reference);

        const discriminatorColumnHeader = this.validateDiscriminator(context, args, reference, overloadArguments);
        const discriminatorExpression = overloadArguments.discriminator != null ? args[overloadArguments.discriminator] : null;

        const result = new LookUpFunctionCall(
            this.table.name.value,
            args[overloadArguments.lookUpValue],
            discriminatorExpression,
            resultColumnHeader.name,
            searchColumnHeader.name,
            discriminatorColumnHeader ? discriminatorColumnHeader.name : null);

        return newValidateMemberFunctionArgumentsSuccess(result);
    }

    private static getArgumentColumns(context: IValidationContext | null, args: ReadonlyArray<Expression>, reference: SourceReference | null):
      OverloadArguments | null {
        switch (args.length){
            case 2:
                //"table.LookUp(lookUpValue, Table.ResultColumn) " +
                return new OverloadArguments(null, 0, null, null, null, 0, 1);

            case 3:
                //"table.LookUp(lookUpValue, Table.SearchColumn, Table.ResultColumn)"
                if (instanceOfMemberAccessExpression(args[1])) {
                    return new OverloadArguments(null, 0, null, null, 1, 0, 2);
                }
                //"table.LookUp(discriminator, lookUpValue, Table.ResultColumn)"
                return new OverloadArguments(0, 1, null, 0, null, 1, 2);

            case 5:
                //"table.LookUp(discriminator, lookUpValue, Table.DiscriminatorColumn, Table.SearchColumn, Table.ResultColumn)";
                return new OverloadArguments(0, 1, 2, 0, 3, 1, 4);

            default:
                if (context && reference) {
                    context.logger.fail(reference, `Invalid number of arguments. ${LookUpFunction.functionHelpValue}`);
                }
                return null;
        }
    }
}
