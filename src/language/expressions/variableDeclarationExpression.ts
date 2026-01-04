import type {INode} from "../node";
import type {IValidationContext} from "../../parser/validationContext";
import type {IExpressionFactory} from "./expressionFactory";

import {Expression} from "./expression";
import {SourceReference} from "../../parser/sourceReference";
import {ExpressionSource} from "./expressionSource";
import {VariableTypeDeclaration} from "../variableTypes/declarations/variableTypeDeclaration";
import {newParseExpressionFailed, newParseExpressionSuccess, ParseExpressionResult} from "./parseExpressionResult";
import {TokenList} from "../../parser/tokens/tokenList";
import {Keywords} from "../../parser/Keywords";
import {StringLiteralToken} from "../../parser/tokens/stringLiteralToken";
import {OperatorType} from "../../parser/tokens/operatorType";
import {VariableType} from "../variableTypes/variableType";
import {ImplicitVariableTypeDeclaration} from "../variableTypes/declarations/implicitVariableTypeDeclaration";
import {VariableSource} from "../variableSource";
import {NodeType} from "../nodeType";
import {MemberAccessLiteralToken} from "../../parser/tokens/memberAccessLiteralToken";
import {VariableUsage} from "./variableUsage";
import {VariableAccess} from "./variableAccess";
import {getReadVariableUsage} from "./getReadVariableUsage";
import {TokenType} from "../../parser/tokens/tokenType";
import {VariableTypeDeclarationParser} from "../variableTypes/declarations/variableTypeDeclarationParser";
import {IdentifierPath} from "../identifierPath";

export function instanceOfVariableDeclarationExpression(object: any): object is VariableDeclarationExpression {
  return object?.nodeType == NodeType.VariableDeclarationExpression;
}

export function asVariableDeclarationExpression(object: any): VariableDeclarationExpression | null {
  return instanceOfVariableDeclarationExpression(object) ? object as VariableDeclarationExpression : null;
}

export class VariableDeclarationExpression extends Expression {

  private variableType: VariableType | null = null;

  public readonly nodeType = NodeType.VariableDeclarationExpression;

  public type: VariableTypeDeclaration;
  public name: string;
  public assignment: Expression | null;

  constructor(variableType: VariableTypeDeclaration, variableName: string, assignment: Expression | null, source: ExpressionSource, reference: SourceReference) {
    super(source, reference)
    this.type = variableType;
    this.name = variableName;
    this.assignment = assignment;
  }

  public static parse(source: ExpressionSource, factory: IExpressionFactory): ParseExpressionResult {
    let tokens = source.tokens;
    if (!VariableDeclarationExpression.isValid(tokens)) {
      return newParseExpressionFailed("VariableDeclarationExpression", `Invalid expression.`);
    }

    const typeName = tokens.tokenValue(0)
    if (typeName == null) {
      return newParseExpressionFailed("VariableDeclarationExpression", `Invalid type name.`);
    }

    let type = VariableTypeDeclarationParser.parse(typeName, source.createReference());
    let name = tokens.tokenValue(1);
    if (name == null) {
      return newParseExpressionFailed("VariableDeclarationExpression", `Invalid name.`);
    }

    let assignment = tokens.length > 3
      ? factory.parse(tokens.tokensFrom(3), source.line)
      : null;

    if (assignment?.state == "failed") return assignment;

    let reference = source.createReference();

    let expression = new VariableDeclarationExpression(type, name, assignment?.result ?? null, source, reference);

    return newParseExpressionSuccess(expression);
  }

  public static isValid(tokens: TokenList): boolean {
    return tokens.length == 2
      && tokens.isKeyword(0, Keywords.ImplicitVariableTypeDeclaration)
      && tokens.isTokenType(1, TokenType.StringLiteralToken)
      || tokens.length == 2
      && tokens.isTokenType(0, TokenType.StringLiteralToken)
      && tokens.isTokenType(1, TokenType.StringLiteralToken)
      || tokens.length == 2
      && tokens.isTokenType(0, TokenType.MemberAccessLiteralToken)
      && tokens.isTokenType(1, TokenType.StringLiteralToken)
      || tokens.length >= 4
      && tokens.isKeyword(0, Keywords.ImplicitVariableTypeDeclaration)
      && tokens.isTokenType(1, TokenType.StringLiteralToken)
      && tokens.isOperatorToken(2, OperatorType.Assignment)
      || tokens.length >= 4
      && tokens.isTokenType(0, TokenType.StringLiteralToken)
      && tokens.isTokenType(1, TokenType.StringLiteralToken)
      && tokens.isOperatorToken(2, OperatorType.Assignment);
  }

  public override getChildren(): Array<INode> {
    const result: Array<INode> = [this.type];
    if (this.assignment != null) result.push(this.assignment);
    return result;
  }

  protected override validate(context: IValidationContext): void {

    const assignmentType = this.assignment ? this.assignment.deriveType(context) : null;

    if (this.assignment != null && assignmentType == null) {
      context.logger.fail(this.reference, `Invalid expression. Could not derive type.`);
    }

    this.variableType = this.getVariableType(context, assignmentType);
    if (this.variableType == null) {
      context.logger.fail(this.reference, `Invalid variable type '${this.type.toString()}'`);
    }

    context.variableContext.registerVariableAndVerifyUnique(this.reference, this.name, this.variableType, VariableSource.Code);
  }

  private getVariableType(context: IValidationContext, assignmentType: VariableType | null): VariableType | null {
    if (this.type.nodeType == NodeType.ImplicitVariableTypeDeclaration) {
      if (assignmentType == null) return null;

      const implicitVariableType = this.type as ImplicitVariableTypeDeclaration;
      implicitVariableType.define(assignmentType);
      return assignmentType;
    }

    let variableType = this.type.variableType;
    if (this.assignment != null && (assignmentType == null || !assignmentType?.equals(variableType))) {
      context.logger.fail(this.reference, `Invalid expression. Literal or enum value expression expected.`);
    }

    return variableType;
  }

  public override deriveType(context: IValidationContext): VariableType | null {
    return null;
  }

  override usedVariables(): ReadonlyArray<VariableUsage> {
    const writeVariable = new VariableUsage(IdentifierPath.parseString(this.name), null, this.variableType, VariableSource.Code, VariableAccess.Write);
    return this.assignment != null ? [writeVariable, ...getReadVariableUsage(this.assignment)] : [writeVariable];
  }
}
