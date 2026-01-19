import type {INode} from "../node";
import type {IExpressionFactory} from "./expressionFactory";
import type {IValidationContext} from "../../parser/validationContext";

import {Expression} from "./expression";
import {OperatorType} from "../../parser/tokens/operatorType";
import {ExpressionOperator} from "./expressionOperator";
import {SourceReference} from "../../parser/sourceReference";
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
import {SourceFile} from "../../parser/sourceFile";

type OperatorCombination = {
  leftType: Type,
  rightType: Type
  operator: ExpressionOperator,
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

export class BinaryExpression extends Expression {

  private static readonly ComparisonOperators: Array<ExpressionOperator> = [
    ExpressionOperator.GreaterThan,
    ExpressionOperator.GreaterThanOrEqual,
    ExpressionOperator.LessThan,
    ExpressionOperator.LessThanOrEqual,
    ExpressionOperator.Equals,
    ExpressionOperator.NotEqual
  ];

  static EnumType() {
    let definition = new EnumDefinition("*", false, new SourceReference(new SourceFile("*"), 1, 1));
    return new EnumType(definition);
  }

  private static AllowedOperationCombinations: Array<OperatorCombination> = [
    { leftType: ValueType.string, rightType: ValueType.string, operator: ExpressionOperator.Equals},
    { leftType: ValueType.number, rightType: ValueType.number, operator: ExpressionOperator.Equals},
    { leftType: ValueType.boolean, rightType: ValueType.boolean, operator: ExpressionOperator.Equals},
    { leftType: ValueType.date, rightType: ValueType.date, operator: ExpressionOperator.Equals},
    { leftType: BinaryExpression.EnumType(), rightType: BinaryExpression.EnumType(), operator: ExpressionOperator.Equals},

    { leftType: ValueType.string, rightType: ValueType.string, operator: ExpressionOperator.NotEqual},
    { leftType: ValueType.number, rightType: ValueType.number, operator: ExpressionOperator.NotEqual},
    { leftType: ValueType.boolean, rightType: ValueType.boolean, operator: ExpressionOperator.NotEqual},
    { leftType: ValueType.date, rightType: ValueType.date, operator: ExpressionOperator.NotEqual},
    { leftType: BinaryExpression.EnumType(), rightType: BinaryExpression.EnumType(), operator: ExpressionOperator.NotEqual},

    { leftType: ValueType.string, rightType: ValueType.string, operator: ExpressionOperator.Addition},
    { leftType: ValueType.string, rightType: ValueType.number, operator: ExpressionOperator.Addition},
    { leftType: ValueType.string, rightType: ValueType.boolean, operator: ExpressionOperator.Addition},
    { leftType: ValueType.string, rightType: ValueType.date, operator: ExpressionOperator.Addition},
    { leftType: ValueType.string, rightType: BinaryExpression.EnumType(), operator: ExpressionOperator.Addition},

    { leftType: ValueType.number, rightType: ValueType.number, operator: ExpressionOperator.Addition},
    { leftType: ValueType.number, rightType: ValueType.number, operator: ExpressionOperator.Subtraction},
    { leftType: ValueType.number, rightType: ValueType.number, operator: ExpressionOperator.Multiplication},
    { leftType: ValueType.number, rightType: ValueType.number, operator: ExpressionOperator.Division},
    { leftType: ValueType.number, rightType: ValueType.number, operator: ExpressionOperator.Modulus},

    { leftType: ValueType.string, rightType: ValueType.string, operator: ExpressionOperator.GreaterThan},
    { leftType: ValueType.string, rightType: ValueType.string, operator: ExpressionOperator.GreaterThanOrEqual},
    { leftType: ValueType.string, rightType: ValueType.string, operator: ExpressionOperator.LessThan},
    { leftType: ValueType.string, rightType: ValueType.string, operator: ExpressionOperator.LessThanOrEqual},

    { leftType: ValueType.number, rightType: ValueType.number, operator: ExpressionOperator.GreaterThan},
    { leftType: ValueType.number, rightType: ValueType.number, operator: ExpressionOperator.GreaterThanOrEqual},
    { leftType: ValueType.number, rightType: ValueType.number, operator: ExpressionOperator.LessThan},
    { leftType: ValueType.number, rightType: ValueType.number, operator: ExpressionOperator.LessThanOrEqual},

    { leftType: ValueType.date, rightType: ValueType.date, operator: ExpressionOperator.GreaterThan},
    { leftType: ValueType.date, rightType: ValueType.date, operator: ExpressionOperator.GreaterThanOrEqual},
    { leftType: ValueType.date, rightType: ValueType.date, operator: ExpressionOperator.LessThan},
    { leftType: ValueType.date, rightType: ValueType.date, operator: ExpressionOperator.LessThanOrEqual},

    { leftType: ValueType.boolean, rightType: ValueType.boolean, operator: ExpressionOperator.And},
    { leftType: ValueType.boolean, rightType: ValueType.boolean, operator: ExpressionOperator.Or},
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

  public nodeType = NodeType.BinaryExpression;
  public left: Expression;
  public right: Expression;
  public operator: ExpressionOperator;
  public leftType: Type | null = null;
  public rightType: Type | null = null;

  constructor(left: Expression, right: Expression, operatorValue: ExpressionOperator,
              source: ExpressionSource, reference: SourceReference) {
    super(source, reference);
    this.left = left;
    this.right = right;
    this.operator = operatorValue;
  }

  public static parse(source: ExpressionSource, factory: IExpressionFactory): ParseExpressionResult {
    let tokens = source.tokens;
    let supportedTokens = BinaryExpression.getCurrentLevelSupportedTokens(tokens);
    let lowestPriorityOperation = BinaryExpression.getLowestPriorityOperation(supportedTokens);
    if (lowestPriorityOperation == null) {
      return newParseExpressionFailed("BinaryExpression", `No valid Operator token found.`);
    }

    let leftTokens = tokens.tokensRange(0, lowestPriorityOperation.index - 1);
    if (leftTokens.length == 0) {
      return newParseExpressionFailed("BinaryExpression",
        `No tokens left from: ${lowestPriorityOperation.index} (${tokens})`);
    }

    let rightTokens = tokens.tokensFrom(lowestPriorityOperation.index + 1);
    if (rightTokens.length == 0) {
      return newParseExpressionFailed("BinaryExpression",
        `No tokens right from: ${lowestPriorityOperation.index} (${tokens})`);
    }

    let left = factory.parse(leftTokens, source.line);
    if (left.state != 'success') return left;

    let right = factory.parse(rightTokens, source.line);
    if (right.state != 'success') return right;

    let operatorValue = lowestPriorityOperation.expressionOperator;
    let reference = source.createReference(lowestPriorityOperation.index);

    let binaryExpression = new BinaryExpression(left.result, right.result, operatorValue, source, reference);
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
    this.leftType = this.left.deriveType(context);
    this.rightType = this.right.deriveType(context);
    if (this.leftType == null || this.rightType == null) {
      context.logger.fail(this.reference,
        `Invalid operator '${this.operator}'. Can't derive type.`);
      return;
    }

    if (!this.isAllowedOperation(this.leftType, this.rightType)) {
      context.logger.fail(this.reference,
        `Invalid operator '${this.operator}'. Left type: '${this.leftType}' and right type '${this.rightType}' not supported.`);
    }
  }

  private isAllowedOperation(left: Type | null, right: Type | null) {
    return any(BinaryExpression.AllowedOperationCombinations, allowed => {
      if (allowed.operator != this.operator) return false;

      let leftEnum = instanceOfEnumType(left);
      let rightEnum = instanceOfEnumType(right);
      let allowedLeftEnum = instanceOfEnumType(allowed.leftType);
      let allowedRightEnum = instanceOfEnumType(allowed.rightType);

      if (allowedLeftEnum && allowedRightEnum) {
        //if left and right is enum, the enum should be of the same typeDeclaration
        return leftEnum && rightEnum && left != null && left.equals(right);
      } else if (allowedLeftEnum) {
        return leftEnum && allowed.rightType.equals(right);
      } else if (allowedRightEnum) {
        return allowed.leftType.equals(left) && rightEnum;
      } else {
        return allowed.leftType.equals(left) && allowed.rightType.equals(right);
      }
    });
  }

  public override deriveType(context: IValidationContext): Type | null {
    if (any(BinaryExpression.ComparisonOperators, operator => operator == this.operator)) {
      return ValueType.boolean;
    }

    let left = this.left.deriveType(context);
    let right = this.right.deriveType(context);

    return left?.equals(right) ? left : null;
  }
}
