import {asParsableNode, IParsableNode, ParsableNode} from "../parsableNode";
import {Expression} from "../expressions/expression";
import {ExpressionList} from "../expressions/expressionList";
import {SourceReference} from "../../parser/sourceReference";
import {IParseLineContext} from "../../parser/ParseLineContext";
import {INode} from "../node";
import {IValidationContext} from "../../parser/validationContext";


export class FunctionCode extends ParsableNode {

   private readonly expressionsValue: ExpressionList;

  public readonly nodeType: "FunctionCode";

  public get expressions(): ReadonlyArray<Expression> {
    return this.expressionsValue.asArray();
   }

   constructor(reference: SourceReference) {
     super(reference);
     this.expressionsValue = new ExpressionList(reference);
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
}
