import type {IParseLineContext} from "../../parser/context/parseLineContext";
import type {IValidationContext} from "../../parser/context/validationContext";

import {asNumberLiteralToken, NumberLiteralToken} from "../../parser/tokens/numberLiteralToken";
import {SourceReference} from "../sourceReference";
import {INode, Node} from "../node";
import {OperatorType} from "../../parser/tokens/operatorType";
import {isValidIdentifier} from "../../parser/tokens/character";
import {NodeType} from "../nodeType";
import {EnumDefinition} from "./enumDefinition";
import {Symbol} from "../symbols/symbol";
import {SymbolKind} from "../symbols/symbolKind";

export function instanceOfEnumMember(object: any) {
  return object?.nodeType == NodeType.EnumMember;
}

export function asEnumMember(object: any): EnumMember | null {
  return instanceOfEnumMember(object) ? object as EnumMember : null;
}

export class EnumMember extends Node {

  public nodeType = NodeType.EnumMember;
  public name: string;
  public valueLiteral: NumberLiteralToken | null;
  public numberValue: number;

  constructor(name: string, valueLiteral: NumberLiteralToken | null, value: number, enumDefinition: EnumDefinition, reference: SourceReference) {
     super(enumDefinition, reference);
     this.numberValue = value;
     this.name = name;
     this.valueLiteral = valueLiteral;
   }

   public static parse(context: IParseLineContext, enumDefinition: EnumDefinition, lastIndex: number): EnumMember | null {

     let valid = context.validateTokens("EnumMember")
       .countMinimum(1)
       .stringLiteral(0)
       .isValid;

     if (!valid) return null;

     const line = context.line;
     const tokens = line.tokens;
     const name = tokens.tokenValue(0);
     if (!name) return null;

     if (tokens.length == 1) {
       return new EnumMember(name, null, lastIndex + 1, enumDefinition, tokens.reference(0, 1));
     }

     if (tokens.length != 3) {
       context.logger.fail(tokens.allReference(), `Invalid number of tokens: ${tokens.length}. Should be 1 or 3.`);
       return null;
     }

     valid = context.validateTokens("EnumMember")
       .operator(1, OperatorType.Assignment)
       .numberLiteral(2)
       .isValid;
     if (!valid) return null;

     let value = tokens.token<NumberLiteralToken>(2, asNumberLiteralToken);
     if (value == null )return null;
     const reference = tokens.allReference();

     return new EnumMember(name, value, value.numberValue, enumDefinition, reference);
   }

   public override getChildren(): Array<INode> {
     return [];
   }

   protected override validate(context: IValidationContext): void {
     this.validateMemberName(context);
     this.validateMemberValues(context);
   }

   private validateMemberName(context: IValidationContext): void {
     if (this.name == null || this.name =='') {
       context.logger.fail(this.reference, `Enum member name should not be null or empty.`);
     } else if (!isValidIdentifier(this.name)) {
       context.logger.fail(this.reference, `Invalid enum member name: ${this.name}.`);
     }
   }

  private validateMemberValues(context: IValidationContext): void {
    if (this.valueLiteral == null) return;

    if (this.valueLiteral.numberValue < 0) {
      context.logger.fail(this.reference, `Enum member value should not be < 0: ${this.valueLiteral}`);
    }

    if (this.valueLiteral.isDecimal()) {
      context.logger.fail(this.reference, `Enum member value should not be decimal: ${this.valueLiteral}`);
    }
  }

  public override getSymbol(): Symbol {
    const parentEnum = this.parent as EnumDefinition;
    return this.valueLiteral != null
      ? new Symbol(this.reference, `enum member: ${parentEnum?.name}.${this.name} = ${this.valueLiteral}`, "", SymbolKind.EnumMember)
      : new Symbol(this.reference, `enum member: ${parentEnum?.name}.${this.name}`, "", SymbolKind.EnumMember);
  }

  public override toString(): string {
    return this.name;
  }
}
