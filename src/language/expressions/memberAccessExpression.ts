import type {IComponentNode} from "../componentNode";
import type {INode} from "../node";
import type {IValidationContext} from "../../parser/context/validationContext";
import type {IExpressionFactory} from "./expressionFactory";
import type {IHasNodeDependencies} from "../IHasNodeDependencies";
import type {IHasVariableReference} from "./IHasVariableReference";
import type {IComponentNodeList} from "../componentNodeList";

import {Expression} from "./expression";
import {IdentifierPath} from "../identifierPath";
import {Type} from "../typeSystem/type";
import {SourceReference} from "../sourceReference";
import {ExpressionSource} from "./expressionSource";
import {asMemberAccessToken, MemberAccessToken} from "../../parser/tokens/memberAccessToken";
import {newParseExpressionFailed, newParseExpressionSuccess, ParseExpressionResult} from "./parseExpressionResult";
import {TokenList} from "../../parser/tokens/tokenList";
import {NodeType} from "../nodeType";
import {VariableReference} from "../variableReference";
import {TokenType} from "../../parser/tokens/tokenType";
import {NodeReference} from "../nodeReference";
import {Symbol} from "../symbols/symbol";
import {SymbolKind} from "../symbols/symbolKind";

export function instanceOfMemberAccessExpression(object: any): boolean {
  return object?.nodeType == NodeType.MemberAccessExpression;
}

export function asMemberAccessExpression(object: any): MemberAccessExpression | null {
  return instanceOfMemberAccessExpression(object) ? object as MemberAccessExpression : null;
}

export class MemberAccessExpression extends Expression
  implements IHasNodeDependencies, IHasVariableReference {

  private variableValue: VariableReference | null = null;

  public readonly hasVariableReference = true;
  public readonly hasNodeDependencies = true;
  public readonly nodeType = NodeType.MemberAccessExpression;

  public readonly memberAccessToken: MemberAccessToken;
  public readonly identifierPath: IdentifierPath;

  public get variable(): VariableReference | null {
    return this.variableValue;
  }

  public get path(): string {
    return this.memberAccessToken.value;
  }

  constructor(identifierPath: IdentifierPath, token: MemberAccessToken,
              source: ExpressionSource, parentReference: NodeReference,
              reference: SourceReference) {
    super(source, parentReference, reference);
    this.memberAccessToken = token;
    this.identifierPath = identifierPath;
  }

  public getDependencies(componentNodes: IComponentNodeList): Array<IComponentNode> {
    let componentNode = componentNodes.getNode(this.memberAccessToken.parent);
    return componentNode != null ? [componentNode] : [];
  }

  public static parse(source: ExpressionSource, parentReference: NodeReference, factory: IExpressionFactory): ParseExpressionResult {
    let tokens = source.tokens;
    if (!MemberAccessExpression.isValid(tokens)) return newParseExpressionFailed("MemberAccessExpression", `Invalid expression.`);

    let literal = tokens.token<MemberAccessToken>(0, asMemberAccessToken);
    if (!literal) return newParseExpressionFailed("MemberAccessExpression", `Invalid expression.`);

    let variable = new IdentifierPath(literal.parts);
    let reference = source.createReference();

    let accessExpression = new MemberAccessExpression(variable, literal, source, parentReference, reference);
    return newParseExpressionSuccess(accessExpression);
  }

  public static isValid(tokens: TokenList): boolean {
    return tokens.length == 1
        && tokens.isTokenType(0, TokenType.MemberAccessToken);
  }

  public override getChildren(): Array<INode> {
    return [];
  }

  protected override validate(context: IValidationContext): void {
    this.createVariableReference(context);
  }

  private createVariableReference(context: IValidationContext) {
    this.variableValue = context.variableContext.createVariableReference(this.reference, this.identifierPath);
    if (this.variableValue == null) {
      context.logger.fail(this.reference, `Invalid identifier: '${this.identifierPath.fullPath()}'`);
    }
  }

  public override deriveType(context: IValidationContext): Type | null {
    return this.memberAccessToken.deriveType(context);
  }

  public override getSymbol(): Symbol | null {
    return this.variable != null
      ? this.variable.getSymbol()
      : new Symbol(this.reference, this.memberAccessToken.toString(), "", SymbolKind.Variable);
  }
}
