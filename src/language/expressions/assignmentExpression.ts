import type {INode} from "../node";
import type {IValidationContext} from "../../parser/context/validationContext";
import type {IExpressionFactory} from "./expressionFactory";

import {Expression} from "./expression";
import {SourceReference} from "../sourceReference";
import {ExpressionSource} from "./expressionSource";
import {newParseExpressionFailed, newParseExpressionSuccess, ParseExpressionResult} from "./parseExpressionResult";
import {TokenList} from "../../parser/tokens/tokenList";
import {OperatorType} from "../../parser/tokens/operatorType";
import {Type} from "../typeSystem/type";
import {NodeType} from "../nodeType";
import {VariableUsage} from "./variableUsage";
import {asHasVariableReference} from "./IHasVariableReference";
import {VariableAccess} from "./variableAccess";
import {getReadVariableUsage} from "./getReadVariableUsage";
import {TokenType} from "../../parser/tokens/tokenType";
import {NodeReference} from "../nodeReference";
import {Symbol} from "../symbols/symbol";

export function instanceOfAssignmentExpression(object: any): object is AssignmentExpression {
  return object?.nodeType == NodeType.AssignmentExpression;
}

export function asAssignmentExpression(object: any): AssignmentExpression | null {
  return instanceOfAssignmentExpression(object) ? object as AssignmentExpression : null;
}

export class AssignmentExpression extends Expression {

  public nodeType = NodeType.AssignmentExpression;
  public variable: Expression
  public assignment: Expression

  private constructor(variable: Expression, assignment: Expression, source: ExpressionSource,
                      parentReference: NodeReference,
                      reference: SourceReference) {
    super(source, parentReference, reference);
    this.variable = variable;
    this.assignment = assignment;
  }

  public static parse(source: ExpressionSource, parentReference: NodeReference, factory: IExpressionFactory): ParseExpressionResult {

    const expressionReference = new NodeReference();
    const tokens = source.tokens;
    if (!AssignmentExpression.isValid(tokens)) return newParseExpressionFailed("AssignmentExpression", `Invalid expression.`);

    let variableExpression = factory.parse(expressionReference, tokens.tokensFromStart(1), source.line);
    if (variableExpression.state != 'success') return variableExpression;

    let assignment = factory.parse(expressionReference, tokens.tokensFrom(2), source.line);
    if (assignment.state != 'success') return assignment;

    let reference = source.createReference();

    let expression = new AssignmentExpression(variableExpression.result, assignment.result, source, parentReference, reference);
    expressionReference.setNode(expression);

    return newParseExpressionSuccess(expression);
  }

  public static isValid(tokens: TokenList): boolean {
    return tokens.length >= 3
      && (tokens.isTokenType(0, TokenType.StringLiteralToken)
        || tokens.isTokenType(0, TokenType.MemberAccessToken))
      && tokens.isOperatorToken(1, OperatorType.Assignment);
  }

  public override getChildren(): Array<INode> {
    return [
      this.variable,
      this.assignment
    ]
  }

  protected override validate(context: IValidationContext): void {

    const hasVariableReference = asHasVariableReference(this.variable);
    if (hasVariableReference == null || hasVariableReference.variable == null) {
      const path = hasVariableReference?.path ?? this.variable.toString();
      context.logger.fail(this.reference, `Unknown variable name: '${path}'.`);
      return;
    }

    const variableReference = hasVariableReference.variable;
    const expressionType = this.assignment.deriveType(context);
    if (expressionType != null && !variableReference.type?.equals(expressionType)) {
      context.logger.fail(this.reference,
        `Variable '${variableReference}' of type '${variableReference.type}' is not assignable from expression of type '${expressionType}'.`);
    }
  }

  public override deriveType(context: IValidationContext): Type | null {
    return this.assignment.deriveType(context);
  }

  override usedVariables(): ReadonlyArray<VariableUsage> {
    const hasVariableReference = asHasVariableReference(this.variable);
    if (hasVariableReference == null || hasVariableReference.variable == null) {
      return getReadVariableUsage(this.assignment);
    }

    const assignmentVariable = hasVariableReference.variable;
    const writeVariableUsage = new VariableUsage(
      this.reference,
      assignmentVariable.path, assignmentVariable.componentType,
      assignmentVariable.type,
      assignmentVariable.source,
      VariableAccess.Write);

    return [writeVariableUsage, ...getReadVariableUsage(this.assignment)];
  }

  public override getSymbol(): Symbol | null {
    return null;
  }
}
