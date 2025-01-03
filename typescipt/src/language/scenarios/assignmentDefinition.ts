import {Expression} from "../expressions/expression";
import {Node} from "../node";
import {ConstantValue} from "./constantValue";
import {VariableReference} from "../../runTime/variableReference";
import {VariableType} from "../variableTypes/variableType";
import {SourceReference} from "../../parser/sourceReference";
import {IParseLineContext} from "../../parser/ParseLineContext";
import {OperatorToken} from "../../parser/tokens/operatorToken";
import {OperatorType} from "../../parser/tokens/operatorType";
import {ExpressionFactory} from "../expressions/expressionFactory";
import {VariableReferenceParser} from "./variableReferenceParser";

export class AssignmentDefinition extends Node {

   private readonly valueExpression: Expression;
   private readonly variableExpression: Expression;

   private variableTypeValue: VariableType;

   public readonly constantValue: ConstantValue;
   public readonly variable: VariableReference;

   public get variableType(): VariableType {
     return this.variableTypeValue;
   }

   constructor(variable: VariableReference, constantValue: ConstantValue, variableExpression: Expression,
     valueExpression: Expression, reference: SourceReference) {
     super(reference);

     this.variable = variable;
     this.constantValue = constantValue;

     this.variableExpression = variableExpression;
     this.valueExpression = valueExpression;
   }

   public static parse(context: IParseLineContext): AssignmentDefinition | null {
     let line = context.line;
     let tokens = line.tokens;
     let reference = line.lineStartReference();

     let assignmentIndex = tokens.find<OperatorToken>(token => token.type == OperatorType.Assignment, OperatorToken);
     if (assignmentIndex <= 0 || assignmentIndex == tokens.length - 1) {
       context.logger.fail(reference, `Invalid assignment. Expected: 'Variable = Value'`);
       return null;
     }

     let targetExpression = ExpressionFactory.parse(tokens.tokensFromStart(assignmentIndex), line);
     if (targetExpression.state == "failed") {
       context.logger.fail(reference, targetExpression.errorMessage);
       return null;
     }

     let valueExpression = ExpressionFactory.parse(tokens.tokensFrom(assignmentIndex + 1), line);
     if (valueExpression.state == "failed") {
       context.logger.fail(reference, valueExpression.errorMessage);
       return null;
     }

     let variableReference = VariableReferenceParser.parse(targetExpression.result);
     if (variableReference.state == "failed") {
       context.logger.fail(reference, variableReference.errorMessage);
       return null;
     }

     let constantValue = ConstantValue.parse(valueExpression.result);
     if (constantValue.state == "failed") {
       context.logger.fail(reference, targetExpression.errorMessage);
       return null;
     }

     return new AssignmentDefinition(variableReference.result, constantValue.result, targetExpression.result,
       valueExpression.result, reference);
   }

   public override getChildren(): Array<INode> {
     yield return variableExpression;
     yield return valueExpression;
   }

   protected override validate(context: IValidationContext): void {
     if (!context.variableContext.contains(Variable, context))
       //logger by IdentifierExpressionValidation
       return;

     let expressionType = valueExpression.deriveType(context);

     VariableType = context.variableContext.getVariableType(Variable, context);
     if (expressionType != null && !expressionType.equals(VariableType))
       context.logger.fail(this.reference,
         $`Variable '{Variable}' of type '{VariableType}' is not assignable from expression of type '{expressionType}'.`);
   }
}
