import type {INode} from "../node";
import type {IValidationContext} from "../../parser/context/validationContext";

import {Expression} from "./expression";
import {ExpressionSource} from "./expressionSource";
import {SourceReference} from "../sourceReference";
import {TokenList} from "../../parser/tokens/tokenList";
import {Type} from "../typeSystem/type";
import {NodeType} from "../nodeType";
import {NodeReference} from "../nodeReference";
import {Symbol} from "../symbols/symbol";
import {SymbolKind} from "../symbols/symbolKind";
import {
  newParseVariableNameExpressionFailed,
  newParseVariableNameExpressionSuccess,
  ParseVariableNameExpressionResult
} from "./parseVariableNameExpressionResult";

export function instanceOfVariableNameExpression(object: any): boolean {
  return object?.nodeType == NodeType.VariableNameExpression;
}

export function asVariableNameExpression(object: any): VariableNameExpression | null {
  return instanceOfVariableNameExpression(object) ? object as VariableNameExpression : null;
}

export class VariableNameExpression extends Expression {

  public readonly isParsableNode = true;
  public readonly nodeType = NodeType.VariableNameExpression;

  public readonly kind: SymbolKind;
  public readonly name: string;

  constructor(name: string, source: ExpressionSource,
              parentReference: NodeReference, reference: SourceReference,
              kind: SymbolKind) {
    super(source, parentReference, reference);
    this.name = name;
    this.kind = kind;
  }

  public static parse(source: ExpressionSource, parentReference: NodeReference, kind: SymbolKind):
    ParseVariableNameExpressionResult {
    const expression = VariableNameExpression.createExpression(source, parentReference, source.tokens, kind);
    return expression == null
         ? newParseVariableNameExpressionFailed("LiteralExpression", "Invalid expression.")
         : newParseVariableNameExpressionSuccess(expression);
  }

  private static createExpression(source: ExpressionSource, parentReference: NodeReference,
                                  tokens: TokenList, kind: SymbolKind) : VariableNameExpression | null {

    if (!VariableNameExpression.isValid(source.tokens)) return null;

    const reference = source.createReference();
    const name = tokens.tokenValue(0);
    if (name == null) {
      return null;
    }
    return new VariableNameExpression(name, source, parentReference, reference, kind);
  }

  private static isValid(tokens: TokenList): boolean {
    return tokens.length == 1 && tokens.isLiteralToken(0);
  }

  public override getChildren(): Array<INode> {
    return [];
  }

  protected override validate(context: IValidationContext): void {
  }

  public override deriveType(context: IValidationContext): Type | null {
    return null;
  }

  public override getSymbol(): Symbol | null {
    return new Symbol(this.reference, this.name, "", this.kind);;
  }
}
