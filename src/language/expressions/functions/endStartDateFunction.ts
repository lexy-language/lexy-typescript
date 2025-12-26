import type {INode} from "../../node";
import type {IValidationContext} from "../../../parser/validationContext";

import {Expression} from "../expression";
import {PrimitiveType} from "../../variableTypes/primitiveType";
import {VariableType} from "../../variableTypes/variableType";
import {FunctionCallExpression} from "./functionCallExpression";
import {ExpressionSource} from "../expressionSource";

export abstract class EndStartDateFunction extends FunctionCallExpression {

  private get functionHelp() {
    return `'${this.functionName}' expects 2 arguments (EndDate, StartDate).`;
  }

  public endDateExpression: Expression;
  public startDateExpression: Expression;

  protected constructor(functionName: string, endDateExpression: Expression, startDateExpression: Expression,
                        source: ExpressionSource) {
    super(functionName, source);
    this.endDateExpression = endDateExpression;
    this.startDateExpression = startDateExpression;
  }

  public override getChildren(): Array<INode> {
    return [this.endDateExpression, this.startDateExpression];
  }

  protected override validate(context: IValidationContext): void {
    context
      .validateType(this.endDateExpression, 1, `EndDate`, PrimitiveType.date, this.reference, this.functionHelp)
      .validateType(this.startDateExpression, 2, `StartDate`, PrimitiveType.date, this.reference, this.functionHelp);
  }

  public override deriveType(context: IValidationContext): VariableType {
    return PrimitiveType.number;
  }
}
