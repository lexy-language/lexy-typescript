import {IParseLineContext} from "../../parser/ParseLineContext";
import {VariablePath} from "../variablePath";
import {ComplexAssignmentDefinition} from "./complexAssignmentDefinition";
import {OperatorToken} from "../../parser/tokens/operatorToken";
import {OperatorType} from "../../parser/tokens/operatorType";
import {TokenType} from "../../parser/tokens/tokenType";
import {VariablePathExpressionParser} from "./variablePathExpressionParser";
import {ConstantValueParser} from "./constantValueParser";
import {AssignmentDefinition} from "./assignmentDefinition";

export type AssignmentDefinitionParserHandler = (context: IParseLineContext, parentVariable: VariablePath | null) => AssignmentDefinition | ComplexAssignmentDefinition | null;

export class AssignmentDefinitionParser {
  public static parse(context: IParseLineContext, parentVariable: VariablePath | null = null): AssignmentDefinition | ComplexAssignmentDefinition | null {
    const line = context.line;
    const tokens = line.tokens;
    const reference = line.lineStartReference();

    const assignmentIndex = tokens.find<OperatorToken>(token => token.type == OperatorType.Assignment, TokenType.OperatorToken);
    if (assignmentIndex <= 0) {
      context.logger.fail(reference, `Invalid assignment. Expected: 'Variable = Value'`);
      return null;
    }

    let targetTokens = tokens.tokensFromStart(assignmentIndex);
    if (parentVariable != null) {
      targetTokens = AssignmentDefinition.addParentVariableAccessor(parentVariable, targetTokens);
    }
    const targetExpression = context.expressionFactory.parse(targetTokens, line);
    if (targetExpression.state == "failed") {
      context.logger.fail(reference, targetExpression.errorMessage);
      return null;
    }

    const variablePath = VariablePathExpressionParser.parseExpression(targetExpression.result);
    if (variablePath.state == "failed") {
      context.logger.fail(reference, variablePath.errorMessage);
      return null;
    }

    if (assignmentIndex == tokens.length - 1) {
      return new ComplexAssignmentDefinition(variablePath.result, reference, AssignmentDefinitionParser.parse);
    }

    const valueExpression = context.expressionFactory.parse(tokens.tokensFrom(assignmentIndex + 1), line);
    if (valueExpression.state == "failed") {
      context.logger.fail(reference, valueExpression.errorMessage);
      return null;
    }

    const constantValue = ConstantValueParser.parse(valueExpression.result);
    if (constantValue.state == "failed") {
      context.logger.fail(reference, constantValue.errorMessage);
      return null;
    }

    return new AssignmentDefinition(variablePath.result, constantValue.result, targetExpression.result,
      valueExpression.result, reference);
  }
}