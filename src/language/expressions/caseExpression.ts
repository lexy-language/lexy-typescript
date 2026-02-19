import type {IParseLineContext} from "../../parser/context/parseLineContext";
import type {INode} from "../node";
import type {IValidationContext} from "../../parser/context/validationContext";

import {Expression} from "./expression";
import {Type} from "../typeSystem/type";
import {asParsableNode, IParsableNode} from "../parsableNode";
import {ExpressionList} from "./expressionList";
import {ExpressionSource} from "./expressionSource";
import {SourceReference} from "../sourceReference";
import {newParseExpressionFailed, newParseExpressionSuccess, ParseExpressionResult} from "./parseExpressionResult";
import {Keywords} from "../../parser/Keywords";
import {TokenList} from "../../parser/tokens/tokenList";
import {NodeType} from "../nodeType";
import {NodeReference} from "../nodeReference";
import {Symbol} from "../symbols/symbol";
import {ExpressionFactory} from "./expressionFactory";

export function instanceOfCaseExpression(object: any): object is CaseExpression {
  return object?.nodeType == NodeType.CaseExpression;
}

export function asCaseExpression(object: any): CaseExpression | null {
  return instanceOfCaseExpression(object) ? object as CaseExpression : null;
}

export class CaseExpression extends Expression implements IParsableNode {

  private readonly expressionsValues: ExpressionList;

  public readonly isParsableNode = true;
  public readonly isChildExpression = true;

  public readonly isDefault: boolean;
  public readonly nodeType = NodeType.CaseExpression;
  public readonly value: Expression | null;
  public valueType: Type | null = null;

   public get expressions(): readonly Expression[]  {
    return this.expressionsValues.asArray();
   }

  constructor(value: Expression | null, isDefault: boolean, source: ExpressionSource,
              parentReference: NodeReference, reference: SourceReference) {
    super(source, parentReference, reference);
     this.value = value;
     this.isDefault = isDefault;
     this.expressionsValues = new ExpressionList(this, reference);
   }

   public parse(context: IParseLineContext): IParsableNode {
     const expression = this.expressionsValues.parse(context);
     if (expression.state != "success") return this;
     const node = asParsableNode(expression.result)
     return node != null ? node : this;
   }

   public override getChildren(): Array<INode> {
    return this.value != null ? [this.value, this.expressionsValues] : [this.expressionsValues];
   }

   public static parse(source: ExpressionSource, parentReference: NodeReference): ParseExpressionResult {
     const tokens = source.tokens;
     if (!CaseExpression.isValid(tokens)) {
       return newParseExpressionFailed("CaseExpression", `Not valid.`);
     }

     if (tokens.isKeyword(0, Keywords.Default)) {
       return CaseExpression.parseDefaultCase(parentReference, source, tokens);
     }

     if (tokens.length == 1) {
       return newParseExpressionFailed("CaseExpression", `Invalid 'case'. No parameters found.`);
     }

     const expressionReference = new NodeReference();
     const value = tokens.tokensFrom(1);
     const valueExpression = ExpressionFactory.parse(expressionReference, value, source.line);
     if (valueExpression.state != 'success') return valueExpression;

     const reference = source.createReference();

     const expression = new CaseExpression(valueExpression.result, false, source, parentReference, reference);
     expressionReference.setNode(expression);
     return newParseExpressionSuccess(expression);
   }

   private static parseDefaultCase(parentReference: NodeReference, source: ExpressionSource, tokens: TokenList): ParseExpressionResult {
     if (tokens.length != 1) {
       return newParseExpressionFailed("CaseExpression", `Invalid 'default' case. No parameters expected.`);
     }

     const reference = source.createReference();
     const expression = new CaseExpression(null, true, source, parentReference, reference);
     return newParseExpressionSuccess(expression);
   }

   public static isValid(tokens: TokenList): boolean {
     return tokens.isKeyword(0, Keywords.Case)
         || tokens.isKeyword(0, Keywords.Default);
   }

   protected override validate(context: IValidationContext): void {
     this.valueType = this.deriveType(context);
   }

   public override deriveType(context: IValidationContext): Type | null {
     return this.value != null ? this.value.deriveType(context) : null;
   }

   public override getSymbol(): Symbol | null {
     return null;
   }
}
