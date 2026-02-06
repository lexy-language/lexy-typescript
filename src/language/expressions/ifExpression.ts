import type {IParseLineContext} from "../../parser/context/parseLineContext";
import type {INode} from "../node";
import type {IExpressionFactory} from "./expressionFactory";
import type {IValidationContext} from "../../parser/context/validationContext";
import type {IChildExpression, IParentExpression} from "./IChildExpression";

import {Expression} from "./expression";
import {asParsableNode, IParsableNode} from "../parsableNode";
import {ExpressionList} from "./expressionList";
import {instanceOfElseExpression} from "./elseExpression";
import {ExpressionSource} from "./expressionSource";
import {SourceReference} from "../sourceReference";
import {newParseExpressionFailed, newParseExpressionSuccess, ParseExpressionResult} from "./parseExpressionResult";
import {TokenList} from "../../parser/tokens/tokenList";
import {Keywords} from "../../parser/Keywords";
import {ValueType} from "../typeSystem/valueType";
import {Type} from "../typeSystem/type";
import {NodeType} from "../nodeType";
import {VariableUsage} from "./variableUsage";
import {getReadVariableUsage} from "./getReadVariableUsage";
import {instanceOfElseifExpression} from "./elseifExpression";
import {lastOrDefault} from "../../infrastructure/arrayFunctions";
import {NodeReference} from "../nodeReference";
import {SuggestionEdit} from "../symbols/suggestionEdit";
import {Suggestions} from "../symbols/suggestions";
import {Symbol} from "../symbols/symbol";

export function instanceOfIfExpression(object: any): boolean {
  return object?.nodeType == NodeType.IfExpression;
}

export function asIfExpression(object: any): IfExpression | null {
  return instanceOfIfExpression(object) ? object as IfExpression : null;
}

export class IfExpression extends Expression implements IParsableNode, IParentExpression {

  private readonly trueExpressionsValues: ExpressionList;
  private readonly elseExpressionsValues: Array<Expression> = [];

  public readonly isParentExpression = true;
  public readonly isParsableNode = true;
  public readonly nodeType = NodeType.IfExpression;

  public condition: Expression

  public get trueExpressions(): ReadonlyArray<Expression> {
    return this.trueExpressionsValues.asArray();
  }

  public get elseExpressions(): ReadonlyArray<Expression> {
    return this.elseExpressionsValues;
  }

  constructor(condition: Expression, source: ExpressionSource, parentReference: NodeReference, reference: SourceReference, factory: IExpressionFactory) {
    super(source, parentReference, reference);
    this.condition = condition;
    this.trueExpressionsValues = new ExpressionList(this, reference, factory);
  }

  public parse(context: IParseLineContext): IParsableNode {
    let expression = this.trueExpressionsValues.parse(context);
    if (expression.state != "success") return this;
    const parsableNode = asParsableNode(expression.result);
    return parsableNode != null ? parsableNode : this;
  }

  public override getChildren(): Array<INode> {
    return [this.condition, this.trueExpressionsValues, ...this.elseExpressions];
  }

  public static parse(source: ExpressionSource, parentReference: NodeReference, factory: IExpressionFactory): ParseExpressionResult {

    const tokens = source.tokens;
    if (!IfExpression.isValid(tokens)) return newParseExpressionFailed("IfExpression", `Not valid.`);

    if (tokens.length == 1) return newParseExpressionFailed("IfExpression", `No condition found`);

    const expressionReference = new NodeReference();
    const condition = tokens.tokensFrom(1);
    const conditionExpression = factory.parse(expressionReference, condition, source.line);
    if (conditionExpression.state != 'success') return conditionExpression;

    const reference = source.createReference();

    const expression = new IfExpression(conditionExpression.result, source, parentReference, reference, factory);
    expressionReference.setNode(expression);

    return newParseExpressionSuccess(expression);
  }

  public static isValid(tokens: TokenList): boolean {
    return tokens.isKeyword(0, Keywords.If);
  }

  protected override validate(context: IValidationContext): void {
    let type = this.condition.deriveType(context);
    if (type == null || !type.equals(ValueType.boolean)) {
      context.logger.fail(this.reference, `'if' condition expression should be 'boolean', is of wrong type '${type}'.`);
    }
  }

  public override deriveType(context: IValidationContext): Type | null {
    return null;
  }

  linkChildExpression(expression: IChildExpression): void {
    if (!(instanceOfElseExpression(expression) || instanceOfElseifExpression(expression))) {
      throw new Error(`Invalid node type: ${expression.nodeType}`);
    }

    let lastOrDefaultExpression = lastOrDefault(this.elseExpressions);
    if (instanceOfElseExpression(lastOrDefaultExpression)) throw new Error(`'else' already defined.`);
    this.elseExpressionsValues.push(expression);
    return;
  }

  override usedVariables(): ReadonlyArray<VariableUsage> {
    return getReadVariableUsage(this.condition);
  }

  public override getSymbol(): Symbol | null {
    return null;
  }

  public override getSuggestions(): readonly SuggestionEdit[] {
    return Suggestions.edit(withSuggestions => withSuggestions
      .keyword(Keywords.Else)
      .keyword(Keywords.Elseif)
    );
  }
}
