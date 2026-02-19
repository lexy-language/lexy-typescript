import {IParseLineContext} from "../../parser/context/parseLineContext";
import {IdentifierPath} from "../identifierPath";
import {ObjectAssignmentDefinition} from "./objectAssignmentDefinition";
import {OperatorToken} from "../../parser/tokens/operatorToken";
import {OperatorType} from "../../parser/tokens/operatorType";
import {TokenType} from "../../parser/tokens/tokenType";
import {IdentifierPathExpressionParser} from "./identifierPathExpressionParser";
import {ConstantValueParser} from "./constantValueParser";
import {AssignmentDefinition} from "./assignmentDefinition";
import {TokenCharacter} from "../../parser/tokens/tokenCharacter";
import {INode} from "../node";
import {NodeReference} from "../nodeReference";
import {TokenList} from "../../parser/tokens/tokenList";
import {Line} from "../../parser/line";
import {asMemberAccessToken, MemberAccessToken} from "../../parser/tokens/memberAccessToken";
import {asStringLiteralToken} from "../../parser/tokens/stringLiteralToken";
import {ExpressionFactory} from "../expressions/expressionFactory";

export type AssignmentDefinitionParserHandler = (context: IParseLineContext, parent: INode, parentVariable: IdentifierPath | null) => AssignmentDefinition | ObjectAssignmentDefinition | null;
export type TokenIdentifierPath = {parts: string[], firstCharacter: TokenCharacter};

export class AssignmentDefinitionParser {
  public static parse(context: IParseLineContext, parent: INode, parentVariable: IdentifierPath | null = null): AssignmentDefinition | ObjectAssignmentDefinition | null {

    const line = context.line;
    const tokens = line.tokens;
    const reference = line.tokens.allReference();

    const assignmentIndex = tokens.find<OperatorToken>(token => token.type == OperatorType.Assignment, TokenType.OperatorToken);
    if (assignmentIndex <= 0) {
      context.logger.fail(reference, `Invalid assignment. Expected: 'Variable = Value'`);
      return null;
    }

    const expressionReference = new NodeReference();
    const targetExpression = this.parseTargetExpression(context, parentVariable, tokens, assignmentIndex, expressionReference, line);
    if (targetExpression.state == "failed") {
      context.logger.fail(reference, targetExpression.errorMessage);
      return null;
    }

    const identifierPath = IdentifierPathExpressionParser.parseExpression(targetExpression.result);
    if (identifierPath.state == "failed") {
      context.logger.fail(reference, identifierPath.errorMessage);
      return null;
    }

    if (assignmentIndex == tokens.length - 1) {
      const definition = new ObjectAssignmentDefinition(identifierPath.result, new NodeReference(parent), reference);
      expressionReference.setNode(definition);
      return definition;
    }

    const valueExpression = ExpressionFactory.parse(expressionReference, tokens.tokensFrom(assignmentIndex + 1), line);
    if (valueExpression.state == "failed") {
      context.logger.fail(reference, valueExpression.errorMessage);
      return null;
    }

    const constantValue = ConstantValueParser.parse(valueExpression.result);
    if (constantValue.state == "failed") {
      context.logger.fail(reference, constantValue.errorMessage);
      return null;
    }

    const assignmentDefinition = new AssignmentDefinition(identifierPath.result, constantValue.result, targetExpression.result,
      valueExpression.result, new NodeReference(parent), reference);
    expressionReference.setNode(assignmentDefinition);
    return assignmentDefinition;
  }

  private static parseTargetExpression(context: IParseLineContext,
                                       parentVariable: IdentifierPath | null,
                                       tokens: TokenList,
                                       assignmentIndex: number,
                                       expressionReference: NodeReference,
                                       line: Line) {
    let targetTokens = tokens.tokensFromStart(assignmentIndex);
    if (parentVariable != null) {
      targetTokens = AssignmentDefinitionParser.addParentVariableAccessor(parentVariable, targetTokens);
    }
    return ExpressionFactory.parse(expressionReference, targetTokens, line);
  }

  private static addParentVariableAccessor(parentVariable: IdentifierPath, targetTokens: TokenList): TokenList {
    if (targetTokens.length != 1) return targetTokens;
    const identifierPath = AssignmentDefinitionParser.getIdentifierPath(targetTokens);
    if (identifierPath == null) {
      return targetTokens;
    }

    const newPath = parentVariable.append(identifierPath.parts).fullPath();
    const newToken = new MemberAccessToken(newPath, identifierPath.firstCharacter, targetTokens.get(0).endColumn);
    return new TokenList(targetTokens.line, [newToken]);
  }

  private static getIdentifierPath(targetTokens: TokenList): TokenIdentifierPath | null {
    const memberAccess = asMemberAccessToken(targetTokens.get(0));
    if (memberAccess != null) {
      return {parts: memberAccess.parts, firstCharacter: memberAccess.firstCharacter};
    }
    const literal = asStringLiteralToken(targetTokens.get(0));
    if (literal != null) {
      return {parts: [literal.value], firstCharacter: literal.firstCharacter};
    }
    return null;
  }
}
