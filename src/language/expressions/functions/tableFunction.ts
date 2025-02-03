import {FunctionCallExpression} from "./functionCallExpression";
import {IHasNodeDependencies} from "../../IHasNodeDependencies";
import {Table} from "../../tables/table";
import {ExpressionSource} from "../expressionSource";
import {IRootNodeList} from "../../rootNodeList";
import {IRootNode} from "../../rootNode";
import {IValidationContext} from "../../../parser/validationContext";
import {MemberAccessLiteral} from "../../../parser/tokens/memberAccessLiteral";
import {ColumnHeader} from "../../tables/columnHeader";
import {VariableType} from "../../variableTypes/variableType";

export abstract class TableFunction extends FunctionCallExpression implements IHasNodeDependencies {

  private tableTypeValue: Table | null = null;

  public readonly hasNodeDependencies = true;

  public readonly table: string

  public get tableType(): Table | null{
    return this.tableTypeValue;
  }

  public abstract get functionHelp(): string;

  protected constructor(tableType: string, functionName: string, source: ExpressionSource) {
    super(functionName, source);
    this.table = tableType;
  }

  public getDependencies(rootNodeList: IRootNodeList): Array<IRootNode> {
    let table = rootNodeList.getTable(this.table);
    return table != null ? [table] : [];
  }

  protected override validate(context: IValidationContext): void {
    this.tableTypeValue = context.rootNodes.getTable(this.table);
    if (this.tableTypeValue == null) {
      context.logger.fail(this.reference,
        `Invalid argument. Table name '${this.table}' not found. ${this.functionHelp}`);
      return;
    }
  }

  protected getColumnHeader(context: IValidationContext, argumentIndex: number, column: MemberAccessLiteral): ColumnHeader | null {

    if (!this.validateColumn(context, column, argumentIndex)) return null;

    const columnHeader = this.tableTypeValue?.header?.get(column);
    if (columnHeader == null) {
      context.logger.fail(this.reference,
        `Invalid argument ${argumentIndex}. Column name '${column}' not found in table '${this.table}'. ${this.functionHelp}`);
      return null;
    }
    return columnHeader;
  }

  private validateColumn(context: IValidationContext, column: MemberAccessLiteral, index: number): boolean {
    if (column.parent != this.table || column.parts.length != 2) {
      context.logger.fail(this.reference,
        `Invalid argument ${index}. Result column table '${column.parent}' should be table name '${this.table}'. ${this.functionHelp}`);
      return false;
    }
    return true;
  }

  protected validateColumnValueType(argumentIndex: number, columnName: MemberAccessLiteral, valueType: VariableType | null, columnType: VariableType | null, context: IValidationContext) {
    if (valueType == null || !valueType.equals(columnType)) {
      context.logger.fail(this.reference,
        `Invalid argument ${argumentIndex}. Column type '${columnName}': '${columnType}' doesn't match condition type '${valueType}'. ${this.functionHelp}`);
    }
  }
}