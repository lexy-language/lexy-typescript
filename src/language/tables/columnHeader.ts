import type {IValidationContext} from "../../parser/context/validationContext";
import type {IParseLineContext} from "../../parser/context/parseLineContext";

import {TypeDeclaration} from "../typeSystem/declarations/typeDeclaration";
import {SourceReference} from "../sourceReference";
import {INode, Node} from "../node";
import {NodeType} from "../nodeType";
import {TypeDeclarationParser} from "../typeSystem/declarations/typeDeclarationParser";
import {VariableNameExpression} from "../expressions/variableNameExpression";
import {NodeReference} from "../nodeReference";
import {Assert} from "../../infrastructure/assert";
import {StringLiteralToken} from "../../parser/tokens/stringLiteralToken";
import {TokenType} from "../../parser/tokens/tokenType";
import {TableSeparatorToken} from "../../parser/tokens/tableSeparatorToken";
import {ExpressionSource} from "../expressions/expressionSource";
import {TokenList} from "../../parser/tokens/tokenList";
import {SymbolKind} from "../symbols/symbolKind";
import {Symbol} from "../symbols/symbol";

export function instanceOfColumnHeader(object: any) {
  return object?.nodeType == NodeType.ColumnHeader;
}

export function asColumnHeader(object: any): ColumnHeader | null {
  return instanceOfColumnHeader(object) ? object as ColumnHeader : null;
}

export class ColumnHeader extends Node {

  public nodeType = NodeType.ColumnHeader;
  public typeDeclaration: TypeDeclaration;
  public nameExpression: VariableNameExpression;

  public name: string

  constructor(nameExpression: VariableNameExpression, typeDeclaration: TypeDeclaration,
              parentReference: NodeReference, reference: SourceReference) {
    super(parentReference, reference);
    this.nameExpression = Assert.notNull(nameExpression, "nameExpression");
    this.typeDeclaration = Assert.notNull(typeDeclaration, "typeDeclaration");
    this.name = nameExpression.name;
  }

  public static parse(context: IParseLineContext, parentReference: NodeReference, index: number): ColumnHeader | null {

    const tokens = context.line.tokens;
    if (!context.validateTokens("TableHeader")
      .type<StringLiteralToken>(index, TokenType.StringLiteralToken)
      .type<StringLiteralToken>(index + 1, TokenType.StringLiteralToken)
      .type<TableSeparatorToken>(index + 2, TokenType.TableSeparatorToken)
      .isValid) {
      return null;
    }

    const columnHeaderReference = new NodeReference();
    const typeName = tokens.get(index);
    if (typeName == null) return null;

    const typeReference = tokens.reference(index, 1);
    const type = TypeDeclarationParser.parse(typeName, columnHeaderReference, typeReference);

    const nameToken = tokens.get(index + 1);
    if (nameToken == null) return null;

    const source = new ExpressionSource(context.line, new TokenList(context.line, [nameToken]))
    const name = VariableNameExpression.parse(source, columnHeaderReference, SymbolKind.TableColumn);
    if (name?.state != "success") return null;

    const reference = tokens.reference(index, 2);

    let columnHeader = new ColumnHeader(name.result, type, parentReference, reference);
    columnHeaderReference.setNode(columnHeader);

    return columnHeader;
  }

  public override getChildren(): Array<INode> {
    return [this.typeDeclaration, this.nameExpression];
  }

  protected override validate(context: IValidationContext): void {
  }

  public override getSymbol(): Symbol {
    return new Symbol(this.reference, `${this.typeDeclaration} ${this.nameExpression}`, "", SymbolKind.TableColumn);
  }
}
