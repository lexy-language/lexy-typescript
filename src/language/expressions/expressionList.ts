import type {IExpressionFactory} from "./expressionFactory";
import type {IValidationContext} from "../../parser/context/validationContext";
import type {IParseLineContext} from "../../parser/context/parseLineContext";
import type {INode} from "../node";
import type {IChildExpression} from "./IChildExpression";

import {Expression} from "./expression";
import {Node} from "../node";
import {SourceReference} from "../sourceReference";
import {ParseExpressionResult} from "./parseExpressionResult";
import {asChildExpression, asParentExpression} from "./IChildExpression";
import {lastOrDefault} from "../../infrastructure/arrayFunctions";
import {NodeType} from "../nodeType";
import {NodeReference} from "../nodeReference";
import {Symbol} from "../symbols/symbol";

export class ExpressionList extends Node {

  private factory: IExpressionFactory;
  private readonly values: Array<Expression> = [];

  public nodeType = NodeType.ExpressionList;

  public get length(): number {
     return this.values.length;
   }

   constructor(parent: INode, reference: SourceReference, factory: IExpressionFactory) {
     super(new NodeReference(parent), reference);
     this.factory = factory;
   }

  public asArray(): Array<Expression> {
     return [...this.values];
  }
  public get(index: number): Expression {
    return this.values[index];
  }

   public override getChildren(): Array<INode> {
     return this.values;
   }

   protected override validate(context: IValidationContext): void {
   }

   public override validateTree(context: IValidationContext): void {
     context.inNodeVariableScope(this, super.validateTree.bind(this));
   }

   public parse(context: IParseLineContext): ParseExpressionResult {
     let line = context.line;
     let expression = this.factory.parse(new NodeReference(this), line.tokens, line);
     if (expression.state != 'success') {
       context.logger.fail(line.tokens.allReference(), expression.errorMessage);
       return expression;
     }

     this.add(expression.result, context);
     return expression;
   }

   private add(expression: Expression, context: IParseLineContext): void {
     const childExpression = asChildExpression(expression);
     if (childExpression != null) {
       this.addToParent(childExpression, context);
     } else {
       this.values.push(expression);
     }
   }

  private addToParent(childExpression: IChildExpression, context: IParseLineContext) {
    const parentExpression = asParentExpression(lastOrDefault(this.values));
    if (childExpression.validateParentExpression(parentExpression, context)) {
      parentExpression?.linkChildExpression(childExpression);
    }
  }

  public override getSymbol(): Symbol | null {
    return null;
  }
}
