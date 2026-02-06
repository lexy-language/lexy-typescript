import type {IParseLineContext} from "../parser/context/parseLineContext";
import type {IValidationContext} from "../parser/context/validationContext";
import type {INode} from "./node";

import {IParsableNode, ParsableNode} from "./parsableNode";
import {SourceReference} from "./sourceReference";
import {NodeType} from "./nodeType";
import {NodeReference} from "./nodeReference";
import {SymbolKind} from "./symbols/symbolKind";
import {Symbol} from "./symbols/symbol";

export class Comments extends ParsableNode {

  private readonly content: Array<string> = [];

  public nodeType = NodeType.Comments;

   constructor(parentReference: NodeReference, sourceReference: SourceReference) {
     super(parentReference, sourceReference);
   }

   public override parse(context: IParseLineContext): IParsableNode {
     let valid = context.validateTokens("Comments")
       .count(1)
       .comment(0)
       .isValid;

     if (!valid) return this;

     let comment = context.line.tokens.tokenValue(0);
     if (comment != null) {
       this.content.push(comment);
     }
     return this;
   }

   public override getChildren(): Array<INode> {
     return [];
   }

   protected override validate(context: IValidationContext): void {
   }

  public override getSymbol(): Symbol {
    return new Symbol(this.reference, "Comments", `//${this.content.join("\n")}`, SymbolKind.Comments);
  }
}
