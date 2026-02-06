import type {IExpressionFactory} from "../expressions/expressionFactory";
import type {IParseLineContext} from "../../parser/context/parseLineContext";
import type {IValidationContext} from "../../parser/context/validationContext";
import type {INode} from "../node";

import {asParsableNode, IParsableNode, ParsableNode} from "../parsableNode";
import {Expression} from "../expressions/expression";
import {ExpressionList} from "../expressions/expressionList";
import {SourceReference} from "../sourceReference";
import {NodeType} from "../nodeType";
import {NodeReference} from "../nodeReference";
import {Function} from "./function";
import {Symbol} from "../symbols/symbol";

export function instanceOfFunctionCode(object: any) {
  return object?.nodeType == NodeType.FunctionCode;
}

export function asFunctionCode(object: any): FunctionCode | null {
  return instanceOfFunctionCode(object) ? object as FunctionCode : null;
}

export class FunctionCode extends ParsableNode {

   private readonly expressionsValue: ExpressionList;

  public readonly nodeType = NodeType.FunctionCode;

  public get expressions(): ReadonlyArray<Expression> {
    return this.expressionsValue.asArray();
   }

   constructor(parent: Function, reference: SourceReference, factory: IExpressionFactory) {
     super(new NodeReference(parent), reference);
     this.expressionsValue = new ExpressionList(this, reference, factory);
   }

   public override parse(context: IParseLineContext): IParsableNode {
     const expression = this.expressionsValue.parse(context);
     if (expression.state != "success") return this;

     const parsableNode = asParsableNode(expression.result)

     return parsableNode != null ? parsableNode : this;
   }

   public override getChildren(): Array<INode> {
     return this.expressionsValue.asArray();
   }

   protected override validate(context: IValidationContext): void {
   }

  public override getSymbol(): Symbol | null {
    return null;
  }
}
