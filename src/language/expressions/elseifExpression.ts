import type {IParseLineContext} from "../../parser/ParseLineContext";
import type {INode} from "../node";
import type {IExpressionFactory} from "./expressionFactory";
import type {IValidationContext} from "../../parser/validationContext";
import type {IChildExpression, IParentExpression} from "./IChildExpression";

import {Expression} from "./expression";
import {asParsableNode, IParsableNode} from "../parsableNode";
import {ExpressionList} from "./expressionList";
import {asElseExpression, ElseExpression} from "./elseExpression";
import {ExpressionSource} from "./expressionSource";
import {SourceReference} from "../../parser/sourceReference";
import {newParseExpressionFailed, newParseExpressionSuccess, ParseExpressionResult} from "./parseExpressionResult";
import {TokenList} from "../../parser/tokens/tokenList";
import {Keywords} from "../../parser/Keywords";
import {PrimitiveType} from "../variableTypes/primitiveType";
import {VariableType} from "../variableTypes/variableType";
import {NodeType} from "../nodeType";
import {VariableUsage} from "./variableUsage";
import {getReadVariableUsage} from "./getReadVariableUsage";

export function instanceOfElseifExpression(object: any): object is ElseifExpression {
  return object?.nodeType == NodeType.ElseifExpression;
}

export function asElseifExpression(object: any): ElseifExpression | null {
  return instanceOfElseifExpression(object) ? object as ElseifExpression : null;
}

export class ElseifExpression extends Expression implements IParsableNode, IChildExpression {

  private readonly trueExpressionsValues: ExpressionList;

  public readonly isParsableNode = true;
  public readonly isChildExpression = true;
  public readonly nodeType = NodeType.ElseifExpression;

  public condition: Expression

  public get trueExpressions(): ReadonlyArray<Expression> {
    return this.trueExpressionsValues.asArray();
  }

  constructor(condition: Expression, source: ExpressionSource, reference: SourceReference, factory: IExpressionFactory) {
    super(source, reference);
    this.condition = condition;
    this.trueExpressionsValues = new ExpressionList(reference, factory);
  }

  public parse(context: IParseLineContext): IParsableNode {
    let expression = this.trueExpressionsValues.parse(context);
    if (expression.state != "success") return this;
    const parsableNode = asParsableNode(expression.result);
    return parsableNode != null ? parsableNode : this;
  }

  public override getChildren(): Array<INode> {
    return [this.condition, this.trueExpressionsValues];
  }

  public static parse(source: ExpressionSource, factory: IExpressionFactory): ParseExpressionResult {
    let tokens = source.tokens;
    if (!ElseifExpression.isValid(tokens)) return newParseExpressionFailed("ElseifExpression", `Not valid.`);

    if (tokens.length == 1) return newParseExpressionFailed("ElseifExpression", `No condition found`);

    let condition = tokens.tokensFrom(1);
    let conditionExpression = factory.parse(condition, source.line);
    if (conditionExpression.state != 'success') return conditionExpression;

    let reference = source.createReference();

    let expression = new ElseifExpression(conditionExpression.result, source, reference, factory);

    return newParseExpressionSuccess(expression);
  }

  public static isValid(tokens: TokenList): boolean {
    return tokens.isKeyword(0, Keywords.Elseif);
  }

  protected override validate(context: IValidationContext): void {
    let type = this.condition.deriveType(context);
    if (type == null || !type.equals(PrimitiveType.boolean)) {
      context.logger.fail(this.reference, `'if' condition expression should be 'boolean', is of wrong type '${type}'.`);
    }
  }

  public override deriveType(context: IValidationContext): VariableType | null {
    return null;
  }

  public validateParentExpression(expression: IParentExpression | null, context: IParseLineContext): boolean {
    if (expression == null || (expression.nodeType != NodeType.IfExpression)) {
      context.logger.fail(this.reference, `'elseif' should be following an 'if' statement. No 'if' statement found.`);
      return false;
    }
    return true;
  }

  override usedVariables(): ReadonlyArray<VariableUsage> {
    return getReadVariableUsage(this.condition);
  }
}
