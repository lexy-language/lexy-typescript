import type {INode} from "../node";
import type {IValidationContext} from "../../parser/context/validationContext";
import {Expression} from "./expression";
import {ExpressionSource} from "./expressionSource";
import {SourceReference} from "../sourceReference";
import {newParseExpressionFailed, newParseExpressionSuccess, ParseExpressionResult} from "./parseExpressionResult";
import {TokenList} from "../../parser/tokens/tokenList";
import {Type} from "../typeSystem/type";
import {NodeType} from "../nodeType";
import {IHasVariableReference} from "./IHasVariableReference";
import {VariableReference} from "../variableReference";
import {VariableUsage} from "./variableUsage";
import {TokenType} from "../../parser/tokens/tokenType";
import {IdentifierPath} from "../identifierPath";
import {NodeReference} from "../nodeReference";
import {Symbol} from "../symbols/symbol";
import {SymbolKind} from "../symbols/symbolKind";

export function instanceOfIdentifierExpression(object: any): boolean {
  return object?.nodeType == NodeType.IdentifierExpression;
}

export function asIdentifierExpression(object: any): IdentifierExpression | null {
  return instanceOfIdentifierExpression(object) ? object as IdentifierExpression : null;
}

export class IdentifierExpression extends Expression implements IHasVariableReference {

  private variableValue: VariableReference | null = null;

  public readonly hasVariableReference = true;
  public readonly nodeType = NodeType.IdentifierExpression;
  public readonly identifier: string;

  public get variable(): VariableReference | null {
    return this.variableValue;
  }

  public get path(): string {
    return this.identifier;
  }

  constructor(identifier: string, source: ExpressionSource, parentReference: NodeReference, reference: SourceReference) {
    super(source, parentReference, reference);
    this.identifier = identifier;
  }

  public static parse(source: ExpressionSource, parentReference: NodeReference): ParseExpressionResult {
    let tokens = source.tokens;
    if (!IdentifierExpression.isValid(tokens)) {
      return newParseExpressionFailed("IdentifierExpression", `Invalid expression`);
    }

    const expression = IdentifierExpression.parseExpression(parentReference, source, tokens);
    if (expression == null) {
      return newParseExpressionFailed("IdentifierExpression",`Invalid token`)
    }
    return newParseExpressionSuccess(expression);
  }

  private static parseExpression(parentReference: NodeReference, source: ExpressionSource, tokens: TokenList): IdentifierExpression | null {
    let variableName = tokens.tokenValue(0);
    if (!variableName) return null;

    let reference = source.createReference();

    return  new IdentifierExpression(variableName, source, parentReference, reference);
  }

  public static isValid(tokens: TokenList): boolean {
    return tokens.length == 1
        && tokens.isTokenType(0, TokenType.StringLiteralToken);
  }

  public override getChildren(): Array<INode> {
    return [];
  }

  protected override validate(context: IValidationContext): void {
    this.createVariableReference(context);
  }

  public createVariableReference(context: IValidationContext) {
    const path = IdentifierPath.parseString(this.identifier);
    this.variableValue = context.variableContext.createVariableReference(this.reference, path);
    if (this.variableValue == null) {
      context.logger.fail(this.reference, `Invalid identifier: '${path.fullPath()}'`);
    }
  }

  public override deriveType(context: IValidationContext): Type | null {
    return context.variableContext.getTypeByName(this.identifier);
  }

  public override usedVariables(): Array<VariableUsage> {
    return this.variableValue != null ? [VariableUsage.read(this.variableValue)] : [];
  }

  public override getSymbol(): Symbol | null {
    return this.variable != null
      ? this.variable.getSymbol()
      : new Symbol(this.reference, this.identifier, "", SymbolKind.Variable);
  }
}
