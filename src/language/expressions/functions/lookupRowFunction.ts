import type {IHasNodeDependencies} from "../../IHasNodeDependencies";
import type {IRootNode} from "../../rootNode";
import type {INode} from "../../node";
import type {IValidationContext} from "../../../parser/validationContext";
import type {IRootNodeList} from "../../rootNodeList";

import {VariableType} from "../../variableTypes/variableType";
import {MemberAccessLiteral} from "../../../parser/tokens/memberAccessLiteral";
import {Expression} from "../expression";
import {
  newParseFunctionCallExpressionsFailed,
  newParseFunctionCallExpressionsSuccess,
  ParseFunctionCallExpressionsResult
} from "../parseFunctionCallExpressionsResult";
import {asIdentifierExpression} from "../identifierExpression";
import {asMemberAccessExpression} from "../memberAccessExpression";
import {NodeType} from "../../nodeType";
import {Assert} from "../../../infrastructure/assert";
import {FunctionCallExpression} from "./functionCallExpression";
import {ExpressionSource} from "../expressionSource";

const argumentsNumber = 3;
const argumentTable = 0;
const argumentLookupValue = 1;
const argumentSearchValueColumn = 2;
const functionHelp = " Arguments: LOOKUPROW(Table, lookUpValue, Table.searchValueColumn)";

export class LookupRowFunction extends FunctionCallExpression implements IHasNodeDependencies {

  private searchValueColumnTypeValue: VariableType | null = null;

  public readonly hasNodeDependencies = true;
  public static readonly functionName: string = `LOOKUPROW`;

  public readonly nodeType = NodeType.LookupRowFunction;
  public readonly table: string

  public readonly valueExpression: Expression

  public readonly searchValueColumn: MemberAccessLiteral

  public get searchValueColumnType(): VariableType {
    return Assert.notNull(this.searchValueColumnTypeValue, "searchValueColumnType");
  }

  constructor(tableType: string, valueExpression: Expression,
              searchValueColumn: MemberAccessLiteral, source: ExpressionSource) {
    super(LookupRowFunction.functionName, source);
    this.table = tableType;
    this.valueExpression = valueExpression;
    this.searchValueColumn = searchValueColumn;
  }

  public getDependencies(rootNodeList: IRootNodeList): Array<IRootNode> {
    let table = rootNodeList.getTable(this.table);
    return table != null ? [table] : [];
  }

  public static create(name: string, source: ExpressionSource,
                      argumentValues: Array<Expression>): ParseFunctionCallExpressionsResult {
    if (argumentValues.length != argumentsNumber) {
      return newParseFunctionCallExpressionsFailed(`Invalid number of arguments. ${functionHelp}`);
    }

    const tableNameExpression = asIdentifierExpression(argumentValues[argumentTable]);
    if (tableNameExpression == null) {
      return newParseFunctionCallExpressionsFailed(
        `Invalid argument {ArgumentTable}. Should be valid table name. {functionHelp}`);
    }

    const searchValueColumnHeader = asMemberAccessExpression(argumentValues[argumentSearchValueColumn]);
    if (searchValueColumnHeader == null) {
      return newParseFunctionCallExpressionsFailed(
        `Invalid argument {ArgumentSearchValueColumn}. Should be search column. {functionHelp}`);
    }

    let tableName = tableNameExpression.identifier;
    let valueExpression = argumentValues[argumentLookupValue];
    let searchValueColumn = searchValueColumnHeader.memberAccessLiteral;

    let lookupFunction =
      new LookupRowFunction(tableName, valueExpression, searchValueColumn, source);
    return newParseFunctionCallExpressionsSuccess(lookupFunction);
  }

  public override getChildren(): Array<INode> {
    return [this.valueExpression];
  }

  protected override validate(context: IValidationContext): void {
    this.validateColumn(context, this.searchValueColumn, argumentSearchValueColumn);

    let tableType = context.rootNodes.getTable(this.table);
    if (tableType == null) {
      context.logger.fail(this.reference,
        `Invalid argument ${argumentTable}. Table name '${this.table}' not found. ${functionHelp}`);
      return;
    }

    let searchColumnHeader = tableType.header?.get(this.searchValueColumn);
    if (searchColumnHeader == null) {
      context.logger.fail(this.reference,
        `Invalid argument ${argumentSearchValueColumn}. Column name '${this.searchValueColumn}' not found in table '${this.table}'. $functionHelp}`);
      return;
    }

    let conditionValueType = this.valueExpression.deriveType(context);
    this.searchValueColumnTypeValue = searchColumnHeader.type.variableType;

    if (conditionValueType == null || !conditionValueType.equals(this.searchValueColumnType)) {
      context.logger.fail(this.reference,
        `Invalid argument ${argumentSearchValueColumn}. Column type '${this.searchValueColumn}': '${this.searchValueColumnType}' doesn't match condition type '${conditionValueType}'. ${functionHelp}`);
    }
  }

  private validateColumn(context: IValidationContext, column: MemberAccessLiteral, index: number): void {
    if (column.parent != this.table)
      context.logger.fail(this.reference,
        `Invalid argument ${index}. Result column table '${column.parent}' should be table name '${this.table}'`);

    if (column.parts.length != 2)
      context.logger.fail(this.reference,
        `Invalid argument ${index}. Result column table '${column.parent}' should be table name '${this.table}'`);
  }

  public override deriveType(context: IValidationContext): VariableType | null {
    let tableType = context.rootNodes.getTable(this.table);
    const rowTypeValue = tableType?.getRowType();
    return !!rowTypeValue ? rowTypeValue : null;
  }
}
