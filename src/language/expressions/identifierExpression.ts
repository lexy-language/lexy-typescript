import type {INode} from "../node";
import type {IValidationContext} from "../../parser/validationContext";
import type {IExpressionFactory} from "./expressionFactory";
import {Expression} from "./expression";
import {ExpressionSource} from "./expressionSource";
import {SourceReference} from "../../parser/sourceReference";
import {newParseExpressionFailed, newParseExpressionSuccess, ParseExpressionResult} from "./parseExpressionResult";
import {TokenList} from "../../parser/tokens/tokenList";
import {StringLiteralToken} from "../../parser/tokens/stringLiteralToken";
import {VariableType} from "../variableTypes/variableType";
import {NodeType} from "../nodeType";
import {IHasVariableReference} from "./IHasVariableReference";
import {VariableReference} from "../variableReference";
import {VariableUsage} from "./variableUsage";
import {TokenType} from "../../parser/tokens/tokenType";
import {IdentifierPath} from "../identifierPath";

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

  constructor(identifier: string, source: ExpressionSource, reference: SourceReference) {
    super(source, reference);
    this.identifier = identifier;
  }

  public static parse(source: ExpressionSource, factory: IExpressionFactory): ParseExpressionResult {
    let tokens = source.tokens;
    if (!IdentifierExpression.isValid(tokens)) return newParseExpressionFailed("IdentifierExpression", `Invalid expression`);

    let variableName = tokens.tokenValue(0);
    if (!variableName) return newParseExpressionFailed("IdentifierExpression",`Invalid token`);

    let reference = source.createReference();

    let expression = new IdentifierExpression(variableName, source, reference);

    return newParseExpressionSuccess(expression);
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
    this.variableValue = context.variableContext.createVariableReference(this.reference, path, context);
    if (this.variableValue == null) {
      context.logger.fail(this.reference, `Invalid identifier: '${path.fullPath()}'`);
    }
  }

  public override deriveType(context: IValidationContext): VariableType | null {
    return context.variableContext.getVariableTypeByName(this.identifier);
  }

  public override usedVariables(): Array<VariableUsage> {
    return this.variableValue != null ? [VariableUsage.read(this.variableValue)] : [];
  }
}
