import type {ILiteralToken} from "../../parser/tokens/ILiteralToken";
import type {INode} from "../node";
import type {IValidationContext} from "../../parser/context/validationContext";
import type {IExpressionFactory} from "./expressionFactory";

import {Expression} from "./expression";
import {ExpressionSource} from "./expressionSource";
import {SourceReference} from "../sourceReference";
import {newParseExpressionFailed, newParseExpressionSuccess, ParseExpressionResult} from "./parseExpressionResult";
import {TokenList} from "../../parser/tokens/tokenList";
import {OperatorType} from "../../parser/tokens/operatorType";
import {Type} from "../typeSystem/type";
import {NodeType} from "../nodeType";
import {NodeReference} from "../nodeReference";
import {Symbol} from "../symbols/symbol";

export function instanceOfSpreadExpression(object: any): boolean {
  return object?.nodeType == NodeType.SpreadExpression;
}

export function asSpreadExpression(object: any): SpreadExpression | null {
  return instanceOfSpreadExpression(object) ? object as SpreadExpression : null;
}

export class SpreadExpression extends Expression {

  public nodeType = NodeType.SpreadExpression;

  constructor(source: ExpressionSource, parentReference: NodeReference, reference: SourceReference) {
    super(source, parentReference, reference);
  }

  public static parse(source: ExpressionSource, parentReference: NodeReference, factory: IExpressionFactory): ParseExpressionResult {

    let tokens = source.tokens;
    if (!SpreadExpression.isValid(tokens)) return newParseExpressionFailed("SpreadExpression", `Invalid expression.`);

    let reference = source.createReference();

    let expression = new SpreadExpression(source, parentReference, reference);
    return newParseExpressionSuccess(expression);
  }

  public static isValid(tokens: TokenList): boolean {
    return tokens.length == 1
        && tokens.isOperatorToken(0, OperatorType.Spread);
  }

  public override getChildren(): Array<INode> {
    return [];
  }

  protected override validate(context: IValidationContext): void {
  }

  public override deriveType(context: IValidationContext): Type | null {
    context.logger.fail(this.reference, "Invalid spread operator. The spread operator '...' can only be used in an Lexy function call with as a single argument.");
    return null;
  }

  public override getSymbol(): Symbol | null {
    return null;
  }
}
