import type {IHasNodeDependencies} from "../../IHasNodeDependencies";
import type {INode} from "../../node";
import type {IValidationContext} from "../../../parser/validationContext";
import type {IRootNode} from "../../rootNode";
import type {IRootNodeList} from "../../rootNodeList";

import {Expression} from "../expression";
import {MemberAccessLiteral} from "../../../parser/tokens/memberAccessLiteral";
import {VariableType} from "../../variableTypes/variableType";
import {
  newParseFunctionCallExpressionsFailed,
  newParseFunctionCallExpressionsSuccess,
  ParseFunctionCallExpressionResult
} from "../parseFunctionCallExpressionResult";
import {asIdentifierExpression} from "../identifierExpression";
import {asMemberAccessExpression} from "../memberAccessExpression";
import {NodeType} from "../../nodeType";
import {Assert} from "../../../infrastructure/assert";
import {FunctionCallExpression} from "./functionCallExpression";
import {ExpressionSource} from "../expressionSource";

const argumentsNumber = 4;
const argumentTable = 0;
const argumentLookupValue = 1;
const argumentSearchValueColumn = 2;
const argumentResultColumn = 3;
const functionHelp = `Arguments: LOOKUP(Table, lookUpValue, Table.searchValueColumn, Table.resultColumn)`;

export class LookupFunction extends FunctionCallExpression implements IHasNodeDependencies {

  public static readonly functionName: string = `LOOKUP`;

  private resultColumnTypeValue: VariableType | null = null;
  private searchValueColumnTypeValue: VariableType | null = null;

  public readonly hasNodeDependencies = true;
  public readonly nodeType = NodeType.LookupFunction;

  public readonly table: string

  public readonly valueExpression: Expression

  public readonly resultColumn: MemberAccessLiteral;
  public readonly searchValueColumn: MemberAccessLiteral;

  public get resultColumnType(): VariableType {
    return Assert.notNull(this.resultColumnTypeValue, "resultColumnType");
  }

  public get searchValueColumnType(): VariableType {
    return Assert.notNull(this.searchValueColumnTypeValue, "searchValueColumnType");
  }

  constructor(tableType: string, valueExpression: Expression,
              resultColumn: MemberAccessLiteral, searchValueColumn: MemberAccessLiteral,
              source: ExpressionSource) {
    super(LookupFunction.functionName, source);
    this.table = tableType;
    this.valueExpression = valueExpression;
    this.resultColumn = resultColumn;
    this.searchValueColumn = searchValueColumn;
  }

  public getDependencies(rootNodeList: IRootNodeList): Array<IRootNode> {
    let table = rootNodeList.getTable(this.table);
    return table != null ? [table] : [];
  }

  public static create(name: string, source: ExpressionSource,
                      argumentValues: Array<Expression>): ParseFunctionCallExpressionResult {
    if (argumentValues.length != argumentsNumber) {
      return newParseFunctionCallExpressionsFailed(`Invalid number of arguments. ${functionHelp}`);
    }

    const tableNameExpression = asIdentifierExpression(argumentValues[argumentTable]);
    if (tableNameExpression == null) {
      return newParseFunctionCallExpressionsFailed(
        `Invalid argument ${argumentTable}. Should be valid table name. ${functionHelp}`);
    }

    const searchValueColumnHeader = asMemberAccessExpression(argumentValues[argumentSearchValueColumn]);
    if (searchValueColumnHeader == null) {
      return newParseFunctionCallExpressionsFailed(
        `Invalid argument ${argumentSearchValueColumn}. Should be search column. ${functionHelp}`);
    }

    const resultColumnExpression = asMemberAccessExpression(argumentValues[argumentResultColumn]);
    if (resultColumnExpression == null) {
      return newParseFunctionCallExpressionsFailed(
        `Invalid argument ${argumentResultColumn}. Should be result column. ${functionHelp}`);
    }

    const tableName = tableNameExpression.identifier;
    const valueExpression = argumentValues[argumentLookupValue];
    const searchValueColumn = searchValueColumnHeader.memberAccessLiteral;
    const resultColumn = resultColumnExpression.memberAccessLiteral;

    const lookupFunction = new LookupFunction(tableName, valueExpression, resultColumn, searchValueColumn,
      source);
    return newParseFunctionCallExpressionsSuccess(lookupFunction);
  }

  public override getChildren(): Array<INode> {
    return [this.valueExpression];
  }

  protected override validate(context: IValidationContext): void {
    this.validateColumn(context, this.resultColumn, argumentResultColumn);
    this.validateColumn(context, this.searchValueColumn, argumentSearchValueColumn);

    const tableType = context.rootNodes.getTable(this.table);
    if (tableType == null) {
      context.logger.fail(this.reference,
        `Invalid argument ${argumentTable}. Table name '${this.table}' not found. ${functionHelp}`);
      return;
    }

    const resultColumnHeader = tableType.header?.get(this.resultColumn);
    if (resultColumnHeader == null) {
      context.logger.fail(this.reference,
        `Invalid argument ${argumentResultColumn}. Column name '${this.resultColumn}' not found in table '${this.table}'. ${functionHelp}`);
      return;
    }

    const searchColumnHeader = tableType.header?.get(this.searchValueColumn);
    if (searchColumnHeader == null) {
      context.logger.fail(this.reference,
        `Invalid argument ${argumentSearchValueColumn}. Column name '${this.searchValueColumn}' not found in table '${this.table}'. ${functionHelp}`);
      return;
    }

    const conditionValueType = this.valueExpression.deriveType(context);
    this.resultColumnTypeValue = resultColumnHeader.type.variableType;
    this.searchValueColumnTypeValue = searchColumnHeader.type.variableType;

    if (conditionValueType == null || !conditionValueType.equals(this.searchValueColumnTypeValue)) {
      context.logger.fail(this.reference,
        `Invalid argument ${argumentSearchValueColumn}. Column type '${this.searchValueColumn}': '${this.searchValueColumnType}' doesn't match condition type '${conditionValueType}'. ${functionHelp}`);
    }
  }

  private validateColumn(context: IValidationContext, column: MemberAccessLiteral, index: number): void {
    if (column.parent != this.table) {
      context.logger.fail(this.reference,
        `Invalid argument ${index}. Result column table '${column.parent}' should be table name '${this.table}'`);
    }

    if (column.parts.length != 2) {
      context.logger.fail(this.reference,
        `Invalid argument ${index}. Result column table '${column.parent}' should be table name '${this.table}'`);
    }
  }

  public override deriveType(context: IValidationContext): VariableType | null {
    let tableType = context.rootNodes.getTable(this.table);
    let resultColumnHeader = tableType?.header?.get(this.resultColumn);

    const variableType = resultColumnHeader?.type.variableType;
    return !!variableType ? variableType : null;
  }
}