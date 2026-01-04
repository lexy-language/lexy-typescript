import {asExpression, Expression} from "../expression";
import {ExpressionSource} from "../expressionSource";
import {TokenList} from "../../../parser/tokens/tokenList";
import {OperatorType} from "../../../parser/tokens/operatorType";
import {VariableUsage} from "../variableUsage";
import {getReadVariableUsageNodes} from "../getReadVariableUsage";
import {TokenType} from "../../../parser/tokens/tokenType";
import {whereSelect} from "../../../infrastructure/arrayFunctions";

export function instanceOfFunctionCallExpression(object: any): object is FunctionCallExpression {
  return object?.isFunctionCallExpression == true;
}

export function asFunctionCallExpression(object: any): FunctionCallExpression | null {
  return instanceOfFunctionCallExpression(object) ? object as FunctionCallExpression : null;
}

export abstract class FunctionCallExpression extends Expression {

  public readonly isFunctionCallExpression = true;

  protected constructor(source: ExpressionSource) {
    super(source, source.createReference());
  }

  public equals(other: FunctionCallExpression): boolean {
    return this.nodeType == other?.nodeType;
  }

  public static isValid(tokens: TokenList): boolean {
    return (tokens.isTokenType(0, TokenType.StringLiteralToken)
         || tokens.isTokenType(0, TokenType.MemberAccessLiteralToken))
      && tokens.isOperatorToken(1, OperatorType.OpenParentheses);
  }

  public override usedVariables(): ReadonlyArray<VariableUsage> {
    return [
      ...getReadVariableUsageNodes(whereSelect(this.getChildren(), node => asExpression(node)))
    ];
  }
}
