import type {INode} from "../node";
import type {IChildExpression, IParentExpression} from "./IChildExpression";
import type {IValidationContext} from "../../parser/context/validationContext";
import type {IParseLineContext} from "../../parser/context/parseLineContext";

import {Expression} from "./expression";
import {asParsableNode, IParsableNode} from "../parsableNode";
import {ExpressionList} from "./expressionList";
import {ExpressionSource} from "./expressionSource";
import {SourceReference} from "../sourceReference";
import {newParseExpressionFailed, newParseExpressionSuccess, ParseExpressionResult} from "./parseExpressionResult";
import {TokenList} from "../../parser/tokens/tokenList";
import {Keywords} from "../../parser/Keywords";
import {Type} from "../typeSystem/type";
import {NodeType} from "../nodeType";
import {NodeReference} from "../nodeReference";
import {SuggestionEdit} from "../symbols/suggestionEdit";
import {Suggestions} from "../symbols/suggestions";
import {Symbol} from "../symbols/symbol";

export function instanceOfElseExpression(object: any): object is ElseExpression {
  return object?.nodeType == NodeType.ElseExpression;
}

export function asElseExpression(object: any): ElseExpression | null {
  return instanceOfElseExpression(object) ? object as ElseExpression : null;
}

export class ElseExpression extends Expression implements IParsableNode, IChildExpression {

  private readonly falseExpressionsValue: ExpressionList;

  public readonly isParsableNode = true;
  public readonly isChildExpression = true;
  public readonly nodeType = NodeType.ElseExpression;

  public get falseExpressions(): ReadonlyArray<Expression> {
    return this.falseExpressionsValue.asArray();
  }

  constructor(source: ExpressionSource, parentReference: NodeReference, reference: SourceReference) {
    super(source, parentReference, reference);
    this.falseExpressionsValue = new ExpressionList(this, reference);
  }

  public validateParentExpression(expression: IParentExpression | null, context: IParseLineContext): boolean {
    if (expression == null || (expression.nodeType != NodeType.IfExpression)) {
      context.logger.fail(this.reference, `'else' should be following an 'if' statement. No 'if' statement found.`);
      return false;
    }
    return true;
  }

  public override getChildren(): Array<INode> {
    return [this.falseExpressionsValue];
  }

  public parse(context: IParseLineContext): IParsableNode {
    let expression = this.falseExpressionsValue.parse(context);
    if (expression.state != "success") return this;
    const node = asParsableNode(expression.result);
    return node != null ? node : this;
  }

  public static parse(source: ExpressionSource, parentReference: NodeReference): ParseExpressionResult {
    let tokens = source.tokens;
    if (!ElseExpression.isValid(tokens)) return newParseExpressionFailed("ElseExpression", `Not valid.`);

    if (tokens.length > 1) return newParseExpressionFailed("ElseExpression", `No tokens expected.`);

    let reference = source.createReference();

    let expression = new ElseExpression(source, parentReference, reference);

    return newParseExpressionSuccess(expression);
  }

  public static isValid(tokens: TokenList): boolean {
    return tokens.isKeyword(0, Keywords.Else);
  }

  protected override validate(context: IValidationContext): void {
  }

  public override deriveType(context: IValidationContext): Type | null {
    return null;
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
