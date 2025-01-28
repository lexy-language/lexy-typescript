import type {IValidationContext} from "../../parser/validationContext";

import {Expression} from "../expressions/expression";
import {INode, Node} from "../node";
import {ConstantValue} from "./constantValue";
import {VariablePath} from "../variablePath";
import {VariableType} from "../variableTypes/variableType";
import {SourceReference} from "../../parser/sourceReference";
import {NodeType} from "../nodeType";
import {TokenList} from "../../parser/tokens/tokenList";
import {asMemberAccessLiteral, MemberAccessLiteral} from "../../parser/tokens/memberAccessLiteral";
import {asStringLiteralToken} from "../../parser/tokens/stringLiteralToken";
import {TokenCharacter} from "../../parser/tokens/tokenCharacter";

export function instanceOfAssignmentDefinition(object: any): object is AssignmentDefinition {
  return object?.nodeType == NodeType.AssignmentDefinition;
}

export function asAssignmentDefinition(object: any): AssignmentDefinition | null {
  return instanceOfAssignmentDefinition(object) ? object as AssignmentDefinition : null;
}

export interface IAssignmentDefinition extends INode {
  flatten(result: Array<AssignmentDefinition>): void;
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