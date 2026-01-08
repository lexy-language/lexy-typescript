import type {INode} from "../node";
import type {IValidationContext} from "../../parser/validationContext";
import type {IExpressionFactory} from "./expressionFactory";

import {Expression} from "./expression";
import {SourceReference} from "../../parser/sourceReference";
import {ExpressionSource} from "./expressionSource";
import {newParseExpressionFailed, newParseExpressionSuccess, ParseExpressionResult} from "./parseExpressionResult";
import {TokenList} from "../../parser/tokens/tokenList";
import {OperatorType} from "../../parser/tokens/operatorType";
import {VariableType} from "../variableTypes/variableType";
import {NodeType} from "../nodeType";
import {VariableUsage} from "./variableUsage";
import {getReadVariableUsage} from "./getReadVariableUsage";
import {VariablesMapping} from "./mapping";
import {asGeneratedType} from "../variableTypes/generatedType";
import {ExtractResultsFunctionExpression} from "./functions/systemFunctions/extractResultsFunctionExpression";

export function instanceOfSpreadAssignmentExpression(object: any): object is SpreadAssignmentExpression {
  return object?.nodeType == NodeType.SpreadAssignmentExpression;
}

export function asSpreadAssignmentExpression(object: any): SpreadAssignmentExpression | null {
  return instanceOfSpreadAssignmentExpression(object) ? object as SpreadAssignmentExpression : null;
}

export class SpreadAssignmentExpression extends Expression {

  public nodeType = NodeType.SpreadAssignmentExpression;
  public mapping: VariablesMapping | null;
  public assignment: Expression;

  private constructor(assignment: Expression,
                      source: ExpressionSource,
                      reference: SourceReference) {
    super(source, reference);
    this.assignment = assignment;
    this.mapping = null;
  }

  public static parse(source: ExpressionSource, factory: IExpressionFactory): ParseExpressionResult {
    let tokens = source.tokens;
    if (!SpreadAssignmentExpression.isValid(tokens)) return newParseExpressionFailed("AssignmentExpression", `Invalid expression.`);

    let assignment = factory.parse(tokens.tokensFrom(2), source.line);
    if (assignment.state != 'success') return assignment;

    let reference = source.createReference();

    let expression = new SpreadAssignmentExpression(assignment.result, source, reference);

    return newParseExpressionSuccess(expression);
  }

  public static isValid(tokens: TokenList): boolean {
    return tokens.length >= 2
      && tokens.isOperatorToken(0, OperatorType.Spread)
      && tokens.isOperatorToken(1, OperatorType.Assignment);
  }

  public override getChildren(): Array<INode> {
    return [this.assignment];
  }

  protected override validate(context: IValidationContext): void {

    const expressionType = this.assignment.deriveType(context);

    const objectResultsType = asGeneratedType(expressionType);
    if (objectResultsType != null) {
      this.mapping = ExtractResultsFunctionExpression.getMapping(this.reference, context, objectResultsType);
    } else {
      context.logger.fail(this.reference, "Couldn't determine type of assignment.");
    }
  }

  public override deriveType(context: IValidationContext): VariableType | null {
    return this.assignment.deriveType(context);
  }

  override usedVariables(): ReadonlyArray<VariableUsage> {
    return getReadVariableUsage(this.assignment);
  }
}
