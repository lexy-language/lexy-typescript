import type {INode} from "../node";
import type {IValidationContext} from "../../parser/context/validationContext";

import {Expression} from "./expression";
import {OperatorType} from "../../parser/tokens/operatorType";
import {ExpressionOperator} from "./expressionOperator";
import {SourceReference} from "../sourceReference";
import {ExpressionSource} from "./expressionSource";
import {newParseExpressionFailed, newParseExpressionSuccess, ParseExpressionResult} from "./parseExpressionResult";
import {TokenList} from "../../parser/tokens/tokenList";
import {OperatorToken} from "../../parser/tokens/operatorToken";
import {Type} from "../typeSystem/type";
import {NodeType} from "../nodeType";
import {ValueType} from "../typeSystem/valueType";
import {any} from "../../infrastructure/arrayFunctions";
import {EnumType, instanceOfEnumType} from "../typeSystem/enumType";
import {EnumDefinition} from "../enums/enumDefinition";
import {NodeReference} from "../nodeReference";
import {Symbol} from "../symbols/symbol";
import {ExpressionFactory} from "./expressionFactory";

class OperatorCombination {
  private readonly leftTypeValue: Type | null;
  private readonly rightTypeValue: Type | null;
  private readonly leftTypeEnum: boolean
  private readonly rightTypeEnum: boolean;
  private readonly expressionOperator: ExpressionOperator;

  private get leftType(): Type {
    if (this.leftTypeEnum || !this.leftTypeValue) throw new Error("Left type is enum");
    return this.leftTypeValue;
  }

  private get rightType(): Type {
    if (this.rightTypeEnum || !this.rightTypeValue) throw new Error("Right type is enum");
    return this.rightTypeValue;
  }

  constructor(leftTypeEnum: boolean, leftType: Type | null, rightTypeEnum: boolean, rightType: Type | null, expressionOperator: ExpressionOperator) {
    this.leftTypeEnum = leftTypeEnum;
    this.leftTypeValue = leftType;
    this.rightTypeEnum = rightTypeEnum;
    this.rightTypeValue = rightType;
    this.expressionOperator = expressionOperator;
  }

  public static new(leftType: Type, rightType: Type | null, expressionOperator: ExpressionOperator): OperatorCombination {
    return new OperatorCombination(false, leftType, false, rightType, expressionOperator);
  }

  public static enums(expressionOperator: ExpressionOperator): OperatorCombination {
    return new OperatorCombination(true, null, true, null, expressionOperator);
  }

  public static rightEnum(leftType: Type, expressionOperator: ExpressionOperator): OperatorCombination {
    return new OperatorCombination(false, leftType, true, null, expressionOperator);
  }

  public allowed(operator: ExpressionOperator, left: Type | null, right: Type | null): boolean {

    if (operator != this.expressionOperator) return false;

    const leftEnum = instanceOfEnumType(left);
    const rightEnum = instanceOfEnumType(right);

    if (this.leftTypeEnum && this.rightTypeEnum)
    {
      //if left and right is enum, the enum should be of the same type
      return leftEnum && rightEnum && left != null && left.equals(right);
    }
    if (this.leftTypeEnum)
    {
      return leftEnum && this.rightType.equals(right);
    }
    if (this.rightTypeEnum)
    {
      return this.leftType && this.leftType.equals(left) && rightEnum;
    }
    return this.leftType && this.leftType.equals(left) && this.rightType && this.rightType.equals(right);
  }
}

class OperatorEntry {
  public operatorType: OperatorType;
  public expressionOperator: ExpressionOperator;

  constructor(operatorType: OperatorType, expressionOperator: ExpressionOperator) {
    this.operatorType = operatorType;
    this.expressionOperator = expressionOperator;
  }
}

class TokenIndex {
  public index: number;
  public operatorType: OperatorType;
  public expressionOperator: ExpressionOperator;

  constructor(index: number, operatorType: OperatorType, expressionOperator: ExpressionOperator) {
    this.index = index;
    this.operatorType = operatorType;
    this.expressionOperator = expressionOperator;
  }
}

export function instanceOfBinaryExpression(object: any): object is BinaryExpression {
  return object?.nodeType == NodeType.BinaryExpression;
}

export function asBinaryExpression(object: any): BinaryExpression | null {
  return instanceOfBinaryExpression(object) ? object as BinaryExpression : null;
}

export class BinaryState {

  public readonly leftType: Type | null = null;
  public readonly rightType: Type | null = null;

  constructor(leftType: Type | null, rightType: Type | null) {
    this.leftType = leftType;
    this.rightType = rightType;
  }
}

export class BinaryExpression extends Expression {

  private static readonly ComparisonOperators: Array<ExpressionOperator> = [
    ExpressionOperator.GreaterThan,
    ExpressionOperator.GreaterThanOrEqual,
    ExpressionOperator.LessThan,
    ExpressionOperator.LessThanOrEqual,
    ExpressionOperator.Equals,
    ExpressionOperator.NotEqual
  ];

  private static AllowedOperationCombinations: Array<OperatorCombination> = [
    OperatorCombination.new(ValueType.string, ValueType.string, ExpressionOperator.Equals),
    OperatorCombination.new(ValueType.number, ValueType.number, ExpressionOperator.Equals),
    OperatorCombination.new(ValueType.boolean, ValueType.boolean, ExpressionOperator.Equals),
    OperatorCombination.new(ValueType.date, ValueType.date, ExpressionOperator.Equals),
    OperatorCombination.enums(ExpressionOperator.Equals),

    OperatorCombination.new(ValueType.string, ValueType.string, ExpressionOperator.NotEqual),
    OperatorCombination.new(ValueType.number, ValueType.number, ExpressionOperator.NotEqual),
    OperatorCombination.new(ValueType.boolean, ValueType.boolean, ExpressionOperator.NotEqual),
    OperatorCombination.new(ValueType.date, ValueType.date, ExpressionOperator.NotEqual),
    OperatorCombination.enums(ExpressionOperator.NotEqual),

    OperatorCombination.new(ValueType.string, ValueType.string, ExpressionOperator.Addition),
    OperatorCombination.new(ValueType.string, ValueType.number, ExpressionOperator.Addition),
    OperatorCombination.new(ValueType.string, ValueType.boolean, ExpressionOperator.Addition),
    OperatorCombination.new(ValueType.string, ValueType.date, ExpressionOperator.Addition),
    OperatorCombination.rightEnum(ValueType.string, ExpressionOperator.Addition),

    OperatorCombination.new(ValueType.number, ValueType.number, ExpressionOperator.Addition),
    OperatorCombination.new(ValueType.number, ValueType.number, ExpressionOperator.Subtraction),
    OperatorCombination.new(ValueType.number, ValueType.number, ExpressionOperator.Multiplication),
    OperatorCombination.new(ValueType.number, ValueType.number, ExpressionOperator.Division),
    OperatorCombination.new(ValueType.number, ValueType.number, ExpressionOperator.Modulus),

    OperatorCombination.new(ValueType.string, ValueType.string, ExpressionOperator.GreaterThan),
    OperatorCombination.new(ValueType.string, ValueType.string, ExpressionOperator.GreaterThanOrEqual),
    OperatorCombination.new(ValueType.string, ValueType.string, ExpressionOperator.LessThan),
    OperatorCombination.new(ValueType.string, ValueType.string, ExpressionOperator.LessThanOrEqual),

    OperatorCombination.new(ValueType.number, ValueType.number, ExpressionOperator.GreaterThan),
    OperatorCombination.new(ValueType.number, ValueType.number, ExpressionOperator.GreaterThanOrEqual),
    OperatorCombination.new(ValueType.number, ValueType.number, ExpressionOperator.LessThan),
    OperatorCombination.new(ValueType.number, ValueType.number, ExpressionOperator.LessThanOrEqual),

    OperatorCombination.new(ValueType.date, ValueType.date, ExpressionOperator.GreaterThan),
    OperatorCombination.new(ValueType.date, ValueType.date, ExpressionOperator.GreaterThanOrEqual),
    OperatorCombination.new(ValueType.date, ValueType.date, ExpressionOperator.LessThan),
    OperatorCombination.new(ValueType.date, ValueType.date, ExpressionOperator.LessThanOrEqual),

    OperatorCombination.new(ValueType.boolean, ValueType.boolean, ExpressionOperator.And),
    OperatorCombination.new(ValueType.boolean, ValueType.boolean, ExpressionOperator.Or),
  ];

  private static readonly SupportedOperatorsByPriority: Array<OperatorEntry> = [
    new OperatorEntry(OperatorType.Multiplication, ExpressionOperator.Multiplication),
    new OperatorEntry(OperatorType.Division, ExpressionOperator.Division),
    new OperatorEntry(OperatorType.Modulus, ExpressionOperator.Modulus),

    new OperatorEntry(OperatorType.Addition, ExpressionOperator.Addition),
    new OperatorEntry(OperatorType.Subtraction, ExpressionOperator.Subtraction),

    new OperatorEntry(OperatorType.GreaterThan, ExpressionOperator.GreaterThan),
    new OperatorEntry(OperatorType.GreaterThanOrEqual, ExpressionOperator.GreaterThanOrEqual),
    new OperatorEntry(OperatorType.LessThan, ExpressionOperator.LessThan),
    new OperatorEntry(OperatorType.LessThanOrEqual, ExpressionOperator.LessThanOrEqual),

    new OperatorEntry(OperatorType.Equals, ExpressionOperator.Equals),
    new OperatorEntry(OperatorType.NotEqual, ExpressionOperator.NotEqual),

    new OperatorEntry(OperatorType.And, ExpressionOperator.And),
    new OperatorEntry(OperatorType.Or, ExpressionOperator.Or)
  ];

  private stateValue: BinaryState | null = null;

  public readonly nodeType = NodeType.BinaryExpression;
  public readonly left: Expression;
  public readonly right: Expression;
  public readonly operator: ExpressionOperator;

  public get state(): BinaryState | null {
    return this.stateValue;
  }

  public get stateRequired(): BinaryState {
    if (this.stateValue == null) throw new Error("State not set.")
    return this.stateValue;
  }

  constructor(left: Expression, right: Expression, operatorValue: ExpressionOperator,
              source: ExpressionSource, parentReference: NodeReference, reference: SourceReference) {
    super(source, parentReference, reference);
    this.left = left;
    this.right = right;
    this.operator = operatorValue;
  }

  public static parse(source: ExpressionSource, parentReference: NodeReference): ParseExpressionResult {
    const tokens = source.tokens;
    const supportedTokens = BinaryExpression.getCurrentLevelSupportedTokens(tokens);
    const lowestPriorityOperation = BinaryExpression.getLowestPriorityOperation(supportedTokens);
    if (lowestPriorityOperation == null) {
      return newParseExpressionFailed("BinaryExpression", `No valid Operator token found.`);
    }

    const leftTokens = tokens.tokensRange(0, lowestPriorityOperation.index - 1);
    if (leftTokens.length == 0) {
      return newParseExpressionFailed("BinaryExpression",
        `No tokens left from: ${lowestPriorityOperation.index} (${tokens})`);
    }

    const rightTokens = tokens.tokensFrom(lowestPriorityOperation.index + 1);
    if (rightTokens.length == 0) {
      return newParseExpressionFailed("BinaryExpression",
        `No tokens right from: ${lowestPriorityOperation.index} (${tokens})`);
    }

    const expressionReference = new NodeReference();
    const left = ExpressionFactory.parse(expressionReference, leftTokens, source.line);
    if (left.state != 'success') return left;

    const right = ExpressionFactory.parse(expressionReference, rightTokens, source.line);
    if (right.state != 'success') return right;

    const operatorValue = lowestPriorityOperation.expressionOperator;
    const reference = source.createReference();

    const binaryExpression = new BinaryExpression(left.result, right.result, operatorValue, source, parentReference, reference);
    expressionReference.setNode(binaryExpression);

    return newParseExpressionSuccess(binaryExpression);
  }

  private static getLowestPriorityOperation(supportedTokens: Array<TokenIndex>): TokenIndex | null {
    for (let index = BinaryExpression.SupportedOperatorsByPriority.length - 1; index >= 0; index--) {
      const supportedOperator = BinaryExpression.SupportedOperatorsByPriority[index];
      for (let indexValues = 0; indexValues < supportedTokens.length; indexValues++) {
        const supportedToken = supportedTokens[indexValues];
        if (supportedOperator.operatorType == supportedToken.operatorType) {
          return supportedToken;
        }
      }
    }

    return null;
  }

  public static isValid(tokens: TokenList): boolean {
    let supportedTokens = BinaryExpression.getCurrentLevelSupportedTokens(tokens);
    return supportedTokens.length > 0;
  }

  private static getCurrentLevelSupportedTokens(tokens: TokenList): Array<TokenIndex> {
    let result = new Array<TokenIndex>();
    let countParentheses = 0;
    let countBrackets = 0;
    for (let index = 0; index < tokens.length; index++) {
      let token = tokens.get(index);
      if (token.tokenType != "OperatorToken") continue;
      const operatorToken = token as OperatorToken;
      switch (operatorToken.type) {
        case OperatorType.OpenParentheses:
          countParentheses++;
          break;
        case OperatorType.CloseParentheses:
          countParentheses--;
          break;
        case OperatorType.OpenBrackets:
          countBrackets++;
          break;
        case OperatorType.CloseBrackets:
          countBrackets--;
          break;
      }

      if (countBrackets != 0 || countParentheses != 0) continue;

      let supported = this.isSupported(operatorToken.type);
      if (supported != null) {
        result.push(new TokenIndex(index, operatorToken.type, supported.expressionOperator));
      }
    }

    return result;
  }

  private static isSupported(operatorTokenType: OperatorType): OperatorEntry | null {
    for (let index = BinaryExpression.SupportedOperatorsByPriority.length - 1; index >= 0; index--) {
      const supportedOperator = BinaryExpression.SupportedOperatorsByPriority[index];
      if (supportedOperator.operatorType == operatorTokenType) {
        return supportedOperator;
      }
    }
    return null;
  }

  public override getChildren(): Array<INode> {
    return [
      this.left,
      this.right
    ];
  }

  protected override validate(context: IValidationContext): void {

    const leftType = this.left.deriveType(context);
    const rightType = this.right.deriveType(context);

    this.stateValue = new BinaryState(leftType, rightType);

    if (leftType == null || rightType == null) {
      context.logger.fail(this.reference,
        `Invalid operator '${this.operator}'. Can't derive type.`);
      return;
    }

    if (!this.isAllowedOperation(leftType, rightType)) {
      context.logger.fail(this.reference,
        `Invalid operator '${this.operator}'. Left type: '${leftType}' and right type '${rightType}' not supported.`);
    }
  }

  private isAllowedOperation(left: Type | null, right: Type | null) {
    return any(BinaryExpression.AllowedOperationCombinations, combination =>
      combination.allowed(this.operator, left, right));
  }

  public override deriveType(context: IValidationContext): Type | null {
    if (any(BinaryExpression.ComparisonOperators, operator => operator == this.operator)) {
      return ValueType.boolean;
    }

    const left = this.left.deriveType(context);
    const right = this.right.deriveType(context);

    return left?.equals(right) ? left : null;
  }

  public override getSymbol(): Symbol | null {
    return null;
  }
}
