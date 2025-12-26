import type {IComponentNode} from "../componentNode";
import type {INode} from "../node";
import type {IValidationContext} from "../../parser/validationContext";
import type {IExpressionFactory} from "./expressionFactory";
import type {IHasNodeDependencies} from "../IHasNodeDependencies";
import type {IHasVariableReference} from "./IHasVariableReference";
import type {IComponentNodeList} from "../componentNodeList";

import {Expression} from "./expression";
import {VariablePath} from "../variablePath";
import {VariableType} from "../variableTypes/variableType";
import {SourceReference} from "../../parser/sourceReference";
import {ExpressionSource} from "./expressionSource";
import {asMemberAccessLiteral, MemberAccessLiteral} from "../../parser/tokens/memberAccessLiteral";
import {newParseExpressionFailed, newParseExpressionSuccess, ParseExpressionResult} from "./parseExpressionResult";
import {TokenList} from "../../parser/tokens/tokenList";
import {NodeType} from "../nodeType";
import {VariableReference} from "../variableReference";
import {TokenType} from "../../parser/tokens/tokenType";

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

  public readonly memberAccessLiteral: MemberAccessLiteral;
  public readonly variablePath: VariablePath;

  public get variable(): VariableReference | null {
    return this.variableValue;
  }

  constructor(variablePath: VariablePath, literal: MemberAccessLiteral, source: ExpressionSource, reference: SourceReference) {
    super(source, reference);
    this.memberAccessLiteral = literal;
    this.variablePath = variablePath;
  }

  public getDependencies(componentNodeList: IComponentNodeList): Array<IComponentNode> {
    let componentNode = componentNodeList.getNode(this.memberAccessLiteral.parent);
    return componentNode != null ? [componentNode] : [];
  }

  public static parse(source: ExpressionSource, factory: IExpressionFactory): ParseExpressionResult {
    let tokens = source.tokens;
    if (!MemberAccessExpression.isValid(tokens)) return newParseExpressionFailed("MemberAccessExpression", `Invalid expression.`);

    let literal = tokens.token<MemberAccessLiteral>(0, asMemberAccessLiteral);
    if (!literal) return newParseExpressionFailed("MemberAccessExpression", `Invalid expression.`);

    let variable = new VariablePath(literal.parts);
    let reference = source.createReference();

    let accessExpression = new MemberAccessExpression(variable, literal, source, reference);
    return newParseExpressionSuccess(accessExpression);
  }

  public static isValid(tokens: TokenList): boolean {
    return tokens.length == 1
      && tokens.isTokenType<MemberAccessLiteral>(0, TokenType.MemberAccessLiteral);
  }

  public override getChildren(): Array<INode> {
    return [];
  }

  protected override validate(context: IValidationContext): void {
    this.createVariableReference(context);
  }

  private createVariableReference(context: IValidationContext) {
    this.variableValue = context.variableContext.createVariableReference(this.reference, this.variablePath, context);
    if (this.variableValue == null) {
      context.logger.fail(this.reference, `Invalid identifier: '${this.variablePath.fullPath()}'`);
    }
  }

  public override deriveType(context: IValidationContext): VariableType | null {
    return this.memberAccessLiteral.deriveType(context);
  }
}
