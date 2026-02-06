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
import {getReadVariableUsage} from "./getReadVariableUsage";
import {VariablesMapping} from "./mapping";
import {asGeneratedType} from "../typeSystem/objects/generatedType";
import {ExtractResultsFunctionExpression} from "./functions/systemFunctions/extractResultsFunctionExpression";
import {NodeReference} from "../nodeReference";
import {Symbol} from "../symbols/symbol";

export function instanceOfSpreadAssignmentExpression(object: any): object is SpreadAssignmentExpression {
  return object?.nodeType == NodeType.SpreadAssignmentExpression;
}

export function asSpreadAssignmentExpression(object: any): SpreadAssignmentExpression | null {
  return instanceOfSpreadAssignmentExpression(object) ? object as SpreadAssignmentExpression : null;
}

export class SpreadAssignmentState {

  public mapping: VariablesMapping | null;

  constructor(mapping: VariablesMapping | null) {
    this.mapping = mapping;
  }
}

export class SpreadAssignmentExpression extends Expression {

  private stateValue: SpreadAssignmentState | null = null;

  public nodeType = NodeType.SpreadAssignmentExpression;
  public assignment: Expression;

  public get state(): SpreadAssignmentState {
    if (this.stateValue == null) throw new Error("State not set.")
    return this.stateValue;
  }

  private constructor(assignment: Expression,
                      source: ExpressionSource,
                      parentReference: NodeReference,
                      reference: SourceReference) {
    super(source, parentReference, reference);
    this.assignment = assignment;
  }

  public static parse(source: ExpressionSource, parentReference: NodeReference, factory: IExpressionFactory): ParseExpressionResult {

    const tokens = source.tokens;
    if (!SpreadAssignmentExpression.isValid(tokens)) return newParseExpressionFailed("AssignmentExpression", `Invalid expression.`);

    const expressionReference = new NodeReference();
    const assignment = factory.parse(expressionReference, tokens.tokensFrom(2), source.line);
    if (assignment.state != 'success') return assignment;

    const reference = source.createReference();

    const expression = new SpreadAssignmentExpression(assignment.result, source, parentReference, reference);
    expressionReference.setNode(expression);

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
    if (objectResultsType == null) {
      context.logger.fail(this.reference, "Couldn't determine typeDeclaration of assignment.");
      return;
    }

    const mapping = ExtractResultsFunctionExpression.getMapping(this.reference, context, objectResultsType);
    this.stateValue = new SpreadAssignmentState(mapping);
  }

  public override deriveType(context: IValidationContext): Type | null {
    return this.assignment.deriveType(context);
  }

  override usedVariables(): ReadonlyArray<VariableUsage> {
    return getReadVariableUsage(this.assignment);
  }

  public override getSymbol(): Symbol | null {
    return null;
  }
}
