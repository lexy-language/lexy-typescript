import type {IValidationContext} from "../../parser/context/validationContext";

import {Expression} from "../expressions/expression";
import {INode, Node} from "../node";
import {ConstantValue} from "./constantValue";
import {IdentifierPath} from "../identifierPath";
import {Type} from "../typeSystem/type";
import {SourceReference} from "../sourceReference";
import {NodeType} from "../nodeType";
import {NodeReference} from "../nodeReference";
import {Symbol} from "../symbols/symbol";

export function instanceOfAssignmentDefinition(object: any): object is AssignmentDefinition {
  return object?.nodeType == NodeType.AssignmentDefinition;
}

export function asAssignmentDefinition(object: any): AssignmentDefinition | null {
  return instanceOfAssignmentDefinition(object) ? object as AssignmentDefinition : null;
}

export interface IAssignmentDefinition extends INode {
  flatten(result: Array<AssignmentDefinition>): void;
}

export class AssignmentDefinitionState
{
  public type: Type;

  constructor(type: Type) {
    this.type = type;
  }
}

export class AssignmentDefinition extends Node implements IAssignmentDefinition {

  public readonly nodeType = NodeType.AssignmentDefinition;

  private readonly valueExpression: Expression;
  private readonly variableExpression: Expression;

  private stateValue: AssignmentDefinitionState | null = null;

  public readonly constantValue: ConstantValue;
  public readonly variable: IdentifierPath;

  public get state(): AssignmentDefinitionState | null{
    return this.stateValue;
  }

  constructor(variable: IdentifierPath, constantValue: ConstantValue, variableExpression: Expression,
              valueExpression: Expression, parentReference: NodeReference, reference: SourceReference) {
    super(parentReference, reference);

    this.variable = variable;
    this.constantValue = constantValue;

    this.variableExpression = variableExpression;
    this.valueExpression = valueExpression;
  }

  public override getChildren(): Array<INode> {
    return [this.variableExpression, this.valueExpression];
  }

  protected override validate(context: IValidationContext): void {
    if (!context.variableContext.containsPath(this.variable))
      //logger by IdentifierExpressionValidation
      return;

    let expressionType = this.valueExpression.deriveType(context);

    const typeValue = context.variableContext.getTypeByPath(this.variable);
    if (typeValue == null) {
      context.logger.fail(this.reference,
        `Type of variable '${this.variable}' is unknown.`);
      return;
    }

    this.stateValue = new AssignmentDefinitionState(typeValue);
    if (expressionType != null && !expressionType.equals(typeValue)) {
      context.logger.fail(this.reference,
        `Variable '${this.variable}' of type '${this.state?.type}' is not assignable from expression of type '${expressionType}'.`);
    }
  }

  flatten(result: Array<AssignmentDefinition>) {
    result.push(this);
  }

  public override getSymbol(): Symbol | null {
    return null;
  }
}
