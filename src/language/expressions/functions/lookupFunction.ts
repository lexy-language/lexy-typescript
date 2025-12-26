import type {INode} from "../../node";
import type {IValidationContext} from "../../../parser/validationContext";

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
import {ExpressionSource} from "../expressionSource";
import {TableFunction} from "./tableFunction";

const argumentsNumber = 4;
const argumentTable = 0;
const argumentLookupValue = 1;
const argumentSearchValueColumn = 2;
const argumentResultColumn = 3;
const functionHelp = `Arguments: lookUp(Table, lookUpValue, Table.searchValueColumn, Table.resultColumn)`;

export class LookupFunction extends TableFunction {

  public static readonly functionName: string = `lookUp`;

  private resultColumnTypeValue: VariableType | null = null;
  private searchValueColumnTypeValue: VariableType | null = null;

  public readonly nodeType = NodeType.LookupFunction;

  public readonly valueExpression: Expression

  public readonly resultColumn: MemberAccessLiteral;
  public readonly searchValueColumn: MemberAccessLiteral;

  override get functionHelp() {
    return functionHelp;
  }

  constructor(tableType: string, valueExpression: Expression,
              resultColumn: MemberAccessLiteral, searchValueColumn: MemberAccessLiteral,
              source: ExpressionSource) {
    super(tableType, LookupFunction.functionName, source);
    this.valueExpression = valueExpression;
    this.resultColumn = resultColumn;
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
    super.validate(context);
    if (this.table == null) return;

    const resultColumnHeader = this.getColumnHeader(context, argumentResultColumn, this.resultColumn);
    const searchColumnHeader = this.getColumnHeader(context, argumentSearchValueColumn, this.searchValueColumn);
    if (resultColumnHeader == null || searchColumnHeader == null) return;

    this.resultColumnTypeValue = resultColumnHeader.type.variableType;
    this.searchValueColumnTypeValue = searchColumnHeader.type.variableType;

    this.validateColumnValueType(
      argumentSearchValueColumn, this.searchValueColumn,
      this.valueExpression.deriveType(context), this.searchValueColumnTypeValue, context);
  }

  public override deriveType(context: IValidationContext): VariableType | null {
    return this.resultColumnTypeValue;
  }
}