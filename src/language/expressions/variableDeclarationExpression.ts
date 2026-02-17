import type {INode} from "../node";
import type {IValidationContext} from "../../parser/context/validationContext";
import type {IExpressionFactory} from "./expressionFactory";

import {Expression} from "./expression";
import {SourceReference} from "../sourceReference";
import {ExpressionSource} from "./expressionSource";
import {TypeDeclaration} from "../typeSystem/declarations/typeDeclaration";
import {newParseExpressionFailed, newParseExpressionSuccess, ParseExpressionResult} from "./parseExpressionResult";
import {TokenList} from "../../parser/tokens/tokenList";
import {Keywords} from "../../parser/Keywords";
import {OperatorType} from "../../parser/tokens/operatorType";
import {Type} from "../typeSystem/type";
import {ImplicitTypeDeclaration} from "../typeSystem/declarations/implicitTypeDeclaration";
import {VariableSource} from "../variableSource";
import {NodeType} from "../nodeType";
import {VariableUsage} from "./variableUsage";
import {VariableAccess} from "./variableAccess";
import {getReadVariableUsage} from "./getReadVariableUsage";
import {TokenType} from "../../parser/tokens/tokenType";
import {TypeDeclarationParser} from "../typeSystem/declarations/typeDeclarationParser";
import {IdentifierPath} from "../identifierPath";
import {Assert} from "../../infrastructure/assert";
import {NodeReference} from "../nodeReference";
import {SymbolKind} from "../symbols/symbolKind";
import {ParseVariableNameExpressionResult} from "./parseVariableNameExpressionResult";
import {Symbol} from "../symbols/symbol";
import {VariableNameExpression} from "./variableNameExpression";

export function instanceOfVariableDeclarationExpression(object: any): object is VariableDeclarationExpression {
  return object?.nodeType == NodeType.VariableDeclarationExpression;
}

export function asVariableDeclarationExpression(object: any): VariableDeclarationExpression | null {
  return instanceOfVariableDeclarationExpression(object) ? object as VariableDeclarationExpression : null;
}

export class VariableDeclarationState {
  public type: Type;

  constructor(type: Type) {
    this.type = type;
  }
}

export class VariableDeclarationExpression extends Expression {

  private stateValue: VariableDeclarationState | null = null;

  public readonly nodeType = NodeType.VariableDeclarationExpression;

  public typeDeclaration: TypeDeclaration;
  public name: string;
  public assignment: Expression | null;
  public nameExpression: VariableNameExpression;

  public get state(): VariableDeclarationState | null {
    return this.stateValue;
  }

  public get stateRequired(): VariableDeclarationState {
    if (this.stateValue == null) throw new Error("State not set.")
    return this.stateValue;
  }

  constructor(type: TypeDeclaration, nameExpression: VariableNameExpression, assignment: Expression | null,
              source: ExpressionSource, parentReference: NodeReference, reference: SourceReference) {
    super(source, parentReference, reference)
    this.typeDeclaration = Assert.notNull(type, "type");
    this.nameExpression = Assert.notNull(nameExpression, "nameExpression");
    this.name = nameExpression.name;
    this.assignment = assignment;
  }

  public static parse(source: ExpressionSource, parentReference: NodeReference, factory: IExpressionFactory): ParseExpressionResult {

    const tokens = source.tokens;
    if (!VariableDeclarationExpression.isValid(tokens)) {
      return newParseExpressionFailed("VariableDeclarationExpression", `Invalid expression.`);
    }
    const expressionReference = new NodeReference();
    const typeValue = Assert.notNull(tokens.tokenValue(0), "type");
    const type = TypeDeclarationParser.parseString(typeValue, expressionReference, tokens.reference(0, 1));
    const assignment = tokens.length > 3
      ? factory.parse(expressionReference, tokens.tokensFrom(3), source.line)
      : null;

    if (assignment?.state == "failed") return assignment;

    const name = VariableDeclarationExpression.getNameExpression(expressionReference, tokens);
    if (name.state == "failed") {
      return newParseExpressionFailed("VariableDeclarationExpression", `Invalid expression.`);
    }

    const reference = source.createReference();

    const expression = new VariableDeclarationExpression(type, name.result, assignment?.result
      ?? null, source, parentReference, reference);
    expressionReference.setNode(expression);

    return newParseExpressionSuccess(expression);
  }

  private static getNameExpression(expressionReference: NodeReference, tokens: TokenList): ParseVariableNameExpressionResult {
    const nameToken = Assert.notNull(tokens.get(1), "nameToken");
    const nameTokens = new TokenList(tokens.line, [nameToken]);
    const expressionSource = new ExpressionSource(tokens.line, nameTokens);
    return VariableNameExpression.parse(expressionSource, expressionReference, SymbolKind.Variable);
  }

  public static isValid(tokens: TokenList): boolean {
    return tokens.length == 2
      && tokens.isKeyword(0, Keywords.ImplicitTypeDeclaration)
      && tokens.isTokenType(1, TokenType.StringLiteralToken)
      || tokens.length == 2
      && tokens.isTokenType(0, TokenType.StringLiteralToken)
      && tokens.isTokenType(1, TokenType.StringLiteralToken)
      || tokens.length == 2
      && tokens.isTokenType(0, TokenType.MemberAccessToken)
      && tokens.isTokenType(1, TokenType.StringLiteralToken)
      || tokens.length >= 4
      && tokens.isKeyword(0, Keywords.ImplicitTypeDeclaration)
      && tokens.isTokenType(1, TokenType.StringLiteralToken)
      && tokens.isOperatorToken(2, OperatorType.Assignment)
      || tokens.length >= 4
      && tokens.isTokenType(0, TokenType.StringLiteralToken)
      && tokens.isTokenType(1, TokenType.StringLiteralToken)
      && tokens.isOperatorToken(2, OperatorType.Assignment);
  }

  public override getChildren(): Array<INode> {
    const result: Array<INode> = [this.typeDeclaration, this.nameExpression];
    if (this.assignment != null) result.push(this.assignment);
    return result;
  }

  protected override validate(context: IValidationContext): void {

    const assignmentType = this.assignment ? this.assignment.deriveType(context) : null;

    if (this.assignment != null && assignmentType == null) {
      context.logger.fail(this.reference, `Invalid expression. Could not derive type.`);
    }

    const type = this.getType(context, assignmentType);
    if (type == null) {
      context.logger.fail(this.reference, `Invalid variable type '${this.typeDeclaration.toString()}'`);
      return;
    }

    context.variableContext.registerVariableAndVerifyUnique(this.reference, this.name, type, VariableSource.Code);

    this.stateValue = new VariableDeclarationState(type);
  }

  private getType(context: IValidationContext, assignmentType: Type | null): Type | null {
    if (this.typeDeclaration.nodeType == NodeType.ImplicitTypeDeclaration) {
      if (assignmentType == null) return null;

      const implicitType = this.typeDeclaration as ImplicitTypeDeclaration;
      implicitType.define(assignmentType);
      return assignmentType;
    }

    const type = this.typeDeclaration.type;
    if (this.assignment != null && (assignmentType == null || !assignmentType?.equals(type))) {
      context.logger.fail(this.reference, `Invalid expression. Literal or enum value expression expected.`);
    }
    return type;
  }

  public override deriveType(context: IValidationContext): Type | null {
    return null;
  }

  override usedVariables(): ReadonlyArray<VariableUsage> {
    const writeVariable = new VariableUsage(
      this.reference,
      IdentifierPath.parseString(this.name),
      null,
      this.stateRequired.type,
      VariableSource.Code,
      VariableAccess.Write);
    return this.assignment != null ? [writeVariable, ...getReadVariableUsage(this.assignment)] : [writeVariable];
  }

  public override getSymbol(): Symbol | null {
    return null;
  }
}
