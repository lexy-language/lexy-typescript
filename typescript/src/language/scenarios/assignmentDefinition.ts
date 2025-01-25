import type {IParseLineContext} from "../../parser/ParseLineContext";
import type {IValidationContext} from "../../parser/validationContext";

import {Expression} from "../expressions/expression";
import {INode, Node} from "../node";
import {ConstantValue} from "./constantValue";
import {VariablePath} from "../variablePath";
import {VariableType} from "../variableTypes/variableType";
import {SourceReference} from "../../parser/sourceReference";
import {OperatorToken} from "../../parser/tokens/operatorToken";
import {OperatorType} from "../../parser/tokens/operatorType";
import {VariablePathParser} from "./variablePathParser";
import {ConstantValueParser} from "./constantValueParser";
import {NodeType} from "../nodeType";
import {ComplexAssignmentDefinition} from "./complexAssignmentDefinition";
import {TokenList} from "../../parser/tokens/tokenList";
import {asMemberAccessLiteral, MemberAccessLiteral} from "../../parser/tokens/memberAccessLiteral";
import {asStringLiteralToken} from "../../parser/tokens/stringLiteralToken";
import {TokenCharacter} from "../../parser/tokens/tokenCharacter";
import {TokenType} from "../../parser/tokens/tokenType";
import {IAssignmentDefinition} from "./IAssignmentDefinition";

export function instanceOfAssignmentDefinition(object: any): object is AssignmentDefinition {
  return object?.nodeType == NodeType.AssignmentDefinition;
}

export function asAssignmentDefinition(object: any): AssignmentDefinition | null {
  return instanceOfAssignmentDefinition(object) ? object as AssignmentDefinition : null;
}

export class AssignmentDefinition extends Node implements IAssignmentDefinition {

  public readonly nodeType = NodeType.AssignmentDefinition;

  private readonly valueExpression: Expression;
  private readonly variableExpression: Expression;

  private variableTypeValue: VariableType | null = null;

  public readonly constantValue: ConstantValue;
  public readonly variable: VariablePath;

  public get variableType(): VariableType | null {
    return this.variableTypeValue;
  }

  constructor(variable: VariablePath, constantValue: ConstantValue, variableExpression: Expression,
              valueExpression: Expression, reference: SourceReference) {
    super(reference);

    this.variable = variable;
    this.constantValue = constantValue;

    this.variableExpression = variableExpression;
    this.valueExpression = valueExpression;
  }

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

    const variablePath = VariablePathParser.parseExpression(targetExpression.result);
    if (variablePath.state == "failed") {
      context.logger.fail(reference, variablePath.errorMessage);
      return null;
    }

    if (assignmentIndex == tokens.length - 1) {
      return new ComplexAssignmentDefinition(variablePath.result, reference);
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

  static addParentVariableAccessor(parentVariable: VariablePath, targetTokens: TokenList): TokenList {
    if (targetTokens.length != 1) return targetTokens;
    const variablePath = AssignmentDefinition.getVariablePath(targetTokens);
    if (variablePath == null) {
      return targetTokens;
    }

    const newPath = parentVariable.append(variablePath.parts).fullPath();
    const newToken = new MemberAccessLiteral(newPath, variablePath.firstCharacter);
    return new TokenList([newToken]);
  }

  private static getVariablePath(targetTokens: TokenList): {parts: Array<string>, firstCharacter: TokenCharacter} | null {
    const memberAccess = asMemberAccessLiteral(targetTokens.get(0));
    if (memberAccess != null) {
      return {parts: memberAccess.parts, firstCharacter: memberAccess.firstCharacter};
    }
    const literal = asStringLiteralToken(targetTokens.get(0));
    if (literal != null) {
      return {parts: [literal.value], firstCharacter: literal.firstCharacter};
    }
    return null;
  }

  public override getChildren(): Array<INode> {
    return [this.variableExpression, this.valueExpression];
  }

  protected override validate(context: IValidationContext): void {
    if (!context.variableContext.containsPath(this.variable, context))
      //logger by IdentifierExpressionValidation
      return;

    let expressionType = this.valueExpression.deriveType(context);

    const variableTypeValue = context.variableContext.getVariableTypeByPath(this.variable, context);
    if (variableTypeValue == null) {
      context.logger.fail(this.reference,
        `Type of variable '${this.variable}' is unknown.`);
      return;
    }

    this.variableTypeValue = variableTypeValue;
    if (expressionType != null && !expressionType.equals(variableTypeValue)) {
      context.logger.fail(this.reference,
        `Variable '${this.variable}' of type '${this.variableType}' is not assignable from expression of type '${expressionType}'.`);
    }
  }

  flatten(result: Array<AssignmentDefinition>) {
    result.push(this);
  }
}
