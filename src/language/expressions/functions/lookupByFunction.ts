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

const argumentsNumber = 6;
const argumentTable = 0;
const argumentDiscriminatorValue = 1;
const argumentLookupValue = 2;
const argumentDiscriminatorValueColumn = 3;
const argumentSearchValueColumn = 4;
const argumentResultColumn = 5;
const functionHelp = `Arguments: LOOKUPBY(Table, discriminatorValue, lookUpValue, Table.DiscriminatorColumn, Table.SearchValueColumn, Table.ResultColumn)`;

export class LookupByFunction extends TableFunction {

  public static readonly functionName: string = `LOOKUPBY`;

  private resultColumnTypeValue: VariableType | null = null;
  private discriminatorValueColumnTypeValue: VariableType | null = null;
  private searchValueColumnTypeValue: VariableType | null = null;

  public readonly nodeType = NodeType.LookupByFunction;

  public readonly discriminatorExpression: Expression
  public readonly valueExpression: Expression

  public readonly resultColumn: MemberAccessLiteral;
  public readonly discriminatorValueColumn: MemberAccessLiteral;
  public readonly searchValueColumn: MemberAccessLiteral;

  override get functionHelp() {
    return functionHelp;
  }

  constructor(tableType: string, discriminatorExpression: Expression, valueExpression: Expression,
              discriminatorColumn: MemberAccessLiteral, searchValueColumn: MemberAccessLiteral, resultColumn: MemberAccessLiteral,
              source: ExpressionSource) {
    super(tableType, LookupByFunction.functionName, source);
    this.discriminatorExpression = discriminatorExpression;
    this.valueExpression = valueExpression;
    this.discriminatorValueColumn = discriminatorColumn;
    this.searchValueColumn = searchValueColumn;
    this.resultColumn = resultColumn;
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
        `Invalid argument ${argumentDiscriminatorValue}. Should be discriminator column. ${functionHelp}`);
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
    const discriminatorExpression = argumentValues[argumentDiscriminatorValue];
    const valueExpression = argumentValues[argumentLookupValue];
    const searchValueColumn = searchValueColumnHeader.memberAccessLiteral;
    const discriminatorValueColumn = discriminatorValueColumnHeader.memberAccessLiteral;
    const resultColumn = resultColumnExpression.memberAccessLiteral;

    const lookupFunction = new LookupByFunction(tableName, discriminatorExpression, valueExpression,
      discriminatorValueColumn, searchValueColumn, resultColumn, source);
    return newParseFunctionCallExpressionsSuccess(lookupFunction);
  }

  public override getChildren(): Array<INode> {
    return [this.valueExpression, this.discriminatorExpression];
  }

  protected override validate(context: IValidationContext): void {
    super.validate(context);

    const discriminatorColumnHeader = this.getColumnHeader(context, argumentDiscriminatorValueColumn, this.discriminatorValueColumn);
    const searchColumnHeader = this.getColumnHeader(context, argumentSearchValueColumn, this.searchValueColumn);
    const resultColumnHeader = this.getColumnHeader(context, argumentResultColumn, this.resultColumn);
    if (discriminatorColumnHeader == null || searchColumnHeader == null || resultColumnHeader == null) return;

    this.resultColumnTypeValue = resultColumnHeader.type.variableType;
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
    return this.resultColumnTypeValue;
  }
}

