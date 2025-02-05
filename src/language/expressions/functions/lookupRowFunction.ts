import type {INode} from "../../node";
import type {IValidationContext} from "../../../parser/validationContext";

import {VariableType} from "../../variableTypes/variableType";
import {MemberAccessLiteral} from "../../../parser/tokens/memberAccessLiteral";
import {Expression} from "../expression";
import {
  newParseFunctionCallExpressionsFailed,
  newParseFunctionCallExpressionsSuccess,
  ParseFunctionCallExpressionResult
} from "../parseFunctionCallExpressionResult";
import {asIdentifierExpression} from "../identifierExpression";
import {asMemberAccessExpression} from "../memberAccessExpression";
import {NodeType} from "../../nodeType";
import {ExpressionSource} from "../expressionSource";
import {TableFunction} from "./tableFunction";

const argumentsNumber = 3;
const argumentTable = 0;
const argumentLookupValue = 1;
const argumentSearchValueColumn = 2;
const functionHelp = " Arguments: LOOKUPROW(Table, lookUpValue, Table.searchValueColumn)";

export class LookupRowFunction extends TableFunction {

  public static readonly functionName: string = `LOOKUPROW`;
  public readonly nodeType = NodeType.LookupRowFunction;

  private searchValueColumnTypeValue: VariableType | null = null;

  public readonly valueExpression: Expression

  public readonly searchValueColumn: MemberAccessLiteral;

  override get functionHelp() {
    return functionHelp;
  }

  constructor(tableType: string, valueExpression: Expression,
              searchValueColumn: MemberAccessLiteral, source: ExpressionSource) {
    super(tableType, LookupRowFunction.functionName, source);
    this.valueExpression = valueExpression;
    this.searchValueColumn = searchValueColumn;
  }

  public static create(name: string, source: ExpressionSource,
                      argumentValues: Array<Expression>): ParseFunctionCallExpressionResult {
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
    super.validate(context);
    if (this.table == null) return;

    const searchColumnHeader = this.getColumnHeader(context, argumentSearchValueColumn, this.searchValueColumn);
    if (searchColumnHeader == null) return;

    this.searchValueColumnTypeValue = searchColumnHeader.type.variableType;

    this.validateColumnValueType(
      argumentSearchValueColumn, this.searchValueColumn,
      this.valueExpression.deriveType(context), this.searchValueColumnTypeValue, context);
  }

  public override deriveType(context: IValidationContext): VariableType | null {
    const rowTypeValue = this.table?.getRowType();
    return !!rowTypeValue ? rowTypeValue : null;
  }
}
