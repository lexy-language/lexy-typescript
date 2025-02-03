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

const argumentsNumber = 5;
const argumentTable = 0;
const argumentDiscriminatorValue = 1;
const argumentLookupValue = 2;
const argumentDiscriminatorValueColumn = 3;
const argumentSearchValueColumn = 4;
const functionHelp = " Arguments: LOOKUPROWBY(Table, discriminator, lookUpValue, Table.discriminatorValueColumn, Table.searchValueColumn)";

export class LookupRowByFunction extends TableFunction {

  public static readonly functionName: string = `LOOKUPROWBY`;

  private discriminatorValueColumnTypeValue: VariableType | null = null;
  private searchValueColumnTypeValue: VariableType | null = null;

  public readonly nodeType = NodeType.LookupRowByFunction;

  public readonly discriminatorExpression: Expression
  public readonly valueExpression: Expression

  public readonly discriminatorValueColumn: MemberAccessLiteral;
  public readonly searchValueColumn: MemberAccessLiteral;

  override get functionHelp() {
    return functionHelp;
  }

  constructor(tableType: string, discriminatorExpression: Expression, valueExpression: Expression,
              discriminatorValueColumn: MemberAccessLiteral, searchValueColumn: MemberAccessLiteral, source: ExpressionSource) {
    super(tableType, LookupRowByFunction.functionName, source);
    this.valueExpression = valueExpression;
    this.discriminatorExpression = discriminatorExpression;
    this.discriminatorValueColumn = discriminatorValueColumn;
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

    const discriminatorValueColumnHeader = asMemberAccessExpression(argumentValues[argumentDiscriminatorValueColumn]);
    if (discriminatorValueColumnHeader == null) {
      return newParseFunctionCallExpressionsFailed(
        `Invalid argument ${argumentSearchValueColumn}. Should be discriminator column. ${functionHelp}`);
    }

    const searchValueColumnHeader = asMemberAccessExpression(argumentValues[argumentSearchValueColumn]);
    if (searchValueColumnHeader == null) {
      return newParseFunctionCallExpressionsFailed(
        `Invalid argument ${argumentSearchValueColumn}. Should be search column. ${functionHelp}`);
    }

    let tableName = tableNameExpression.identifier;
    let discriminatorExpression = argumentValues[argumentDiscriminatorValue];
    let valueExpression = argumentValues[argumentLookupValue];
    let discriminatorValueColumn = discriminatorValueColumnHeader.memberAccessLiteral;
    let searchValueColumn = searchValueColumnHeader.memberAccessLiteral;

    let lookupFunction =
      new LookupRowByFunction(tableName, discriminatorExpression, valueExpression, discriminatorValueColumn, searchValueColumn, source);
    return newParseFunctionCallExpressionsSuccess(lookupFunction);
  }

  public override getChildren(): Array<INode> {
    return [this.valueExpression, this.discriminatorExpression];
  }

  protected override validate(context: IValidationContext): void {
    super.validate(context);

    const discriminatorColumnHeader = this.getColumnHeader(context, argumentDiscriminatorValueColumn, this.discriminatorValueColumn);
    const searchColumnHeader = this.getColumnHeader(context, argumentSearchValueColumn, this.searchValueColumn);
    if (discriminatorColumnHeader == null || searchColumnHeader == null) return;

    this.searchValueColumnTypeValue = searchColumnHeader.type.variableType;
    this.discriminatorValueColumnTypeValue = discriminatorColumnHeader.type.variableType;

    this.validateColumnValueType(
      argumentSearchValueColumn, this.searchValueColumn,
      this.valueExpression.deriveType(context), this.searchValueColumnTypeValue, context);

    this.validateColumnValueType(
      argumentDiscriminatorValueColumn, this.discriminatorValueColumn,
      this.discriminatorExpression.deriveType(context), this.discriminatorValueColumnTypeValue, context);
  }

  public override deriveType(context: IValidationContext): VariableType | null {
    const rowTypeValue = this.tableType?.getRowType();
    return !!rowTypeValue ? rowTypeValue : null;
  }
}
