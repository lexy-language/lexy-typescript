import type {INode} from "../node";
import type {IValidationContext} from "../../parser/validationContext";
import type {IExpressionFactory} from "./expressionFactory";

import {Expression} from "./expression";
import {SourceReference} from "../../parser/sourceReference";
import {ExpressionSource} from "./expressionSource";
import {newParseExpressionFailed, newParseExpressionSuccess, ParseExpressionResult} from "./parseExpressionResult";
import {TokenList} from "../../parser/tokens/tokenList";
import {OperatorType} from "../../parser/tokens/operatorType";
import {StringLiteralToken} from "../../parser/tokens/stringLiteralToken";
import {MemberAccessLiteralToken} from "../../parser/tokens/memberAccessLiteralToken";
import {VariableType} from "../variableTypes/variableType";
import {NodeType} from "../nodeType";
import {VariableUsage} from "./variableUsage";
import {asHasVariableReference} from "./IHasVariableReference";
import {VariableAccess} from "./variableAccess";
import {getReadVariableUsage} from "./getReadVariableUsage";
import {TokenType} from "../../parser/tokens/tokenType";

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
                      reference: SourceReference) {
    super(source, reference);
    this.variable = variable;
    this.assignment = assignment;
  }

  public static parse(source: ExpressionSource, factory: IExpressionFactory): ParseExpressionResult {
    let tokens = source.tokens;
    if (!AssignmentExpression.isValid(tokens)) return newParseExpressionFailed("AssignmentExpression", `Invalid expression.`);

    let variableExpression = factory.parse(tokens.tokensFromStart(1), source.line);
    if (variableExpression.state != 'success') return variableExpression;

    let assignment = factory.parse(tokens.tokensFrom(2), source.line);
    if (assignment.state != 'success') return assignment;

    let reference = source.createReference();

    let expression = new AssignmentExpression(variableExpression.result, assignment.result, source, reference);

    return newParseExpressionSuccess(expression);
  }

  public static isValid(tokens: TokenList): boolean {
    return tokens.length >= 3
      && (tokens.isTokenType(0, TokenType.StringLiteralToken)
        || tokens.isTokenType(0, TokenType.MemberAccessLiteralToken))
      && tokens.isOperatorToken(1, OperatorType.Assignment);
  }

  public override getChildren(): Array<INode> {
    return [
      this.assignment,
      this.variable
    ]
  }

  protected override validate(context: IValidationContext): void {

    const hasVariableReference = asHasVariableReference(this.variable);
    if (hasVariableReference == null || hasVariableReference.variable == null) {
      context.logger.fail(this.reference, `Unknown variable name: '${this.variable}'.`);
      return;
    }

    const variableReference = hasVariableReference.variable;
    const expressionType = this.assignment.deriveType(context);
    if (expressionType != null && !variableReference.variableType?.equals(expressionType)) {
      context.logger.fail(this.reference,
        `Variable '${variableReference}' of type '${variableReference.variableType}' is not assignable from expression of type '${expressionType}'.`);
    }
  }

  public override deriveType(context: IValidationContext): VariableType | null {
    return this.assignment.deriveType(context);
  }

  override usedVariables(): ReadonlyArray<VariableUsage> {
    const hasVariableReference = asHasVariableReference(this.variable);
    if (hasVariableReference == null || hasVariableReference.variable == null) {
      return getReadVariableUsage(this.assignment);
    }

    const assignmentVariable = hasVariableReference.variable;
    const writeVariableUsage = new VariableUsage(
      assignmentVariable.path, assignmentVariable.componentType,
      assignmentVariable.variableType,
      assignmentVariable.source,
      VariableAccess.Write);

    return [writeVariableUsage, ...getReadVariableUsage(this.assignment)];
  }
}
