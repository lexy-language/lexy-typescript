import type {INode} from "../node";
import type {IParseLineContext} from "../../parser/context/parseLineContext";
import type {IValidationContext} from "../../parser/context/validationContext";
import type {IParsableNode} from "../parsableNode";

import {Expression} from "./expression";
import {asCaseExpression, CaseExpression} from "./caseExpression";
import {ExpressionSource} from "./expressionSource";
import {SourceReference} from "../sourceReference";
import {newParseExpressionFailed, newParseExpressionSuccess, ParseExpressionResult} from "./parseExpressionResult";
import {TokenList} from "../../parser/tokens/tokenList";
import {Keywords} from "../../parser/Keywords";
import {Type} from "../typeSystem/type";
import {NodeType} from "../nodeType";
import {TypeKind} from "../typeSystem/typeKind";
import {NodeReference} from "../nodeReference";
import {Suggestions} from "../symbols/suggestions";
import {SuggestionEdit} from "../symbols/suggestionEdit";
import {Symbol} from "../symbols/symbol";
import {ExpressionFactory} from "./expressionFactory";

export function instanceOfSwitchExpression(object: any): boolean {
  return object?.nodeType == NodeType.SwitchExpression;
}

export function asSwitchExpression(object: any): SwitchExpression | null {
  return instanceOfSwitchExpression(object) ? object as SwitchExpression : null;
}

export class SwitchExpression extends Expression implements IParsableNode {

  private readonly casesValues: CaseExpression[] = [];

  public readonly isParsableNode = true;
  public readonly nodeType = NodeType.SwitchExpression;

  public conditionType: Type | null = null;
  public readonly condition: Expression;

  public get cases(): readonly CaseExpression[] {
    return this.casesValues;
  }

  constructor(condition: Expression, source: ExpressionSource,
              reference: SourceReference, parentReference: NodeReference) {
    super(source, parentReference, reference);
    this.condition = condition;
  }

   public parse(context: IParseLineContext): IParsableNode {
     let line = context.line;
     let expression = ExpressionFactory.parse(this, line.tokens, line);
     if (expression.state != 'success') {
       context.logger.fail(line.tokens.allReference(), expression.errorMessage);
       return this;
     }

     const caseExpression = asCaseExpression(expression.result);
     if (caseExpression != null) {
       this.casesValues.push(caseExpression);
       return caseExpression;
     }

     context.logger.fail(expression.result.reference, `Invalid expression. 'case' or 'default' expected.`);
     return this;
   }

  public override getChildren(): Array<INode> {
    const result = [this.condition];
    this.cases.forEach(caseValue => result.push(caseValue));
    return result;
  }

   public static parse(source: ExpressionSource, parentReference: NodeReference): ParseExpressionResult {
     const tokens = source.tokens;
     if (!SwitchExpression.isValid(tokens)) return newParseExpressionFailed("SwitchExpression", `Not valid.`);

     if (tokens.length == 1) return newParseExpressionFailed("SwitchExpression", `No condition found`);

     const expressionReference = new NodeReference();
     const condition = tokens.tokensFrom(1);
     const conditionExpression = ExpressionFactory.parse(expressionReference, condition, source.line);
     if (conditionExpression.state != 'success') return conditionExpression;

     const reference = source.createReference();

     const expression = new SwitchExpression(conditionExpression.result, source, reference, parentReference);
     expressionReference.setNode(expression);

     return newParseExpressionSuccess(expression);
   }

   public static isValid(tokens: TokenList): boolean {
     return tokens.isKeyword(0, Keywords.Switch);
   }

   protected override validate(context: IValidationContext): void {
     this.conditionType = this.condition.deriveType(context);
     if (this.conditionType == null
       || this.conditionType.typeKind != TypeKind.ValueType
       && this.conditionType.typeKind != TypeKind.EnumType) {
       context.logger.fail(this.reference,
         `'Switch' condition expression should have a value or enum type. Not: '${this.conditionType}'.`);
       return;
     }

     this.cases.forEach(caseExpression => {
       if (caseExpression.isDefault) return;

       let caseType = caseExpression.deriveType(context);
       if (caseType == null || !this.conditionType?.equals(caseType))
         context.logger.fail(this.reference,
           `'case' condition expression should be of type '${this.conditionType}', is of wrong type '${caseType}'.`);
     });
   }

   public override deriveType(context: IValidationContext): Type | null {
     return null;
   }

  public override getSymbol(): Symbol | null {
    return null;
  }

  public override getSuggestions(): readonly SuggestionEdit[] {
    return Suggestions.edit(withSuggestions => withSuggestions
      .keyword(Keywords.Case)
      .keyword(Keywords.Default)
    );
  }
}
