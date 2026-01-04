import type {IInstanceFunction} from "../../functions/IInstanceFunction";
import type {IValidationContext} from "../../../parser/validationContext";

import {Table} from "../../tables/table";
import {Assert} from "../../../infrastructure/assert";
import {Expression} from "../../expressions/expression";
import {ValidateInstanceFunctionArgumentsResult} from "../../functions/validateInstanceFunctionArgumentsResult";
import {VariableType} from "../variableType";
import {ColumnHeader} from "../../tables/columnHeader";
import {asMemberAccessExpression, MemberAccessExpression} from "../../expressions/memberAccessExpression";
import {IdentifierPath} from "../../identifierPath";
import {SourceReference} from "../../../parser/sourceReference";

type OverLoadArguments = {
    discriminator: number | null,
    discriminatorColumnArgument: number | null,
    defaultDiscriminatorColumn: number | null,
}

export abstract class TableFunction implements IInstanceFunction {

    protected table: Table ;

    protected abstract functionHelp: string;

    protected constructor(table: Table) {
        this.table = Assert.notNull(table, "table");
    }

    public abstract validateArguments(context: IValidationContext ,
        args: ReadonlyArray<Expression>,
        reference: SourceReference): ValidateInstanceFunctionArgumentsResult;

    public abstract getResultsType(args: ReadonlyArray<Expression>): VariableType | null;

    protected validateTable(context: IValidationContext, reference: SourceReference): boolean {
        if (this.table.header == null || this.table.header.columns.length < 2)
        {
            context.logger.fail(reference, `At least 2 columns expected for table '${this.table.name}'. ${this.functionHelp}`);
            return false;
        }
        return true;
    }

    protected validateColumnValueType(context: IValidationContext, args: ReadonlyArray<Expression>,
        valueColumn: number, argumentName: string, columnHeader: ColumnHeader,  reference: SourceReference) {
        let valueType = args[valueColumn].deriveType(context);

        this.validateColumnValueTypeValue(context, valueColumn, argumentName,
          columnHeader.name, valueType,
          Assert.notNull(columnHeader.type.variableType, "columnHeader.type.variableType"), reference);
    }

    private validateColumnValueTypeValue(context: IValidationContext, argumentIndex: number, argumentName: string,
                                    columnName: string, valueType: VariableType | null, columnType: VariableType, reference: SourceReference)
    {
        if (valueType == null) {
            context.logger.fail(reference,
                `Invalid argument ${argumentIndex + 1}. Should be ${argumentName} column. ${this.functionHelp}`);
        }
        else if (!valueType.equals(columnType)) {
            context.logger.fail(reference,
                `Invalid column type '${columnName}': '${columnType}' doesn't match condition type '${valueType}'. ${this.functionHelp}`);
        }
    }

    protected validateDiscriminator(context: IValidationContext, args: ReadonlyArray<Expression>,
                                  reference: SourceReference, overloadArguments: OverLoadArguments): ColumnHeader | null {

        if (overloadArguments.discriminator == null) return null;

        const discriminatorColumnHeader = overloadArguments.defaultDiscriminatorColumn != null
          ? this.getColumn(context, args, overloadArguments.discriminatorColumnArgument, overloadArguments.defaultDiscriminatorColumn, reference)
          : null;
        if (discriminatorColumnHeader == null) return null;
        this.validateColumnValueType(context, args, overloadArguments.discriminator, "Discriminator", discriminatorColumnHeader, reference);

        return discriminatorColumnHeader;
    }

    protected getColumn(context: IValidationContext, args: ReadonlyArray<Expression>,
                        argumentIndex: number | null, defaultColumn: number | null, reference: SourceReference): ColumnHeader | null {
        if (argumentIndex == null) {
            if (defaultColumn == null) {
                throw new Error("Default column should not be null");
            }
            return this.table.header ? this.table.header.getColumnByIndex(defaultColumn) : null;
        }

        let column = asMemberAccessExpression(args[argumentIndex]);
        if (column == null) {
            context.logger.fail(reference, `Invalid column at argument '${argumentIndex + 1}'. ${this.functionHelp}`);
            return null;
        }

        return this.getColumnHeader(context, argumentIndex, column, reference);
    }

    private getColumnHeader(context: IValidationContext,  argumentIndex: number, column: MemberAccessExpression, reference: SourceReference): ColumnHeader | null {
        if (!this.validateColumn(context, column.identifierPath, argumentIndex, reference)) return null;

        var columnHeader = this.table.header?.get(column.identifierPath);
        if (!columnHeader)
        {
            context.logger.fail(reference,
                `Invalid argument ${argumentIndex}. Column name '${column}' not found in table '${this.table.name}'. ${this.functionHelp}`);
            return null;
        }

        return columnHeader;
    }

    private validateColumn(context: IValidationContext, columnIdentifier: IdentifierPath,
                           index: number, reference: SourceReference): boolean {

        if (columnIdentifier.rootIdentifier != this.table.name.value || columnIdentifier.parts != 2) {
            context.logger.fail(reference,
                `Invalid argument {index}. Result column table '${columnIdentifier.rootIdentifier}' should be table name '${this.table.name}'. ${this.functionHelp}`);
            return false;
        }

        return true;
    }
}