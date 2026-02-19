import {VerifyContext} from "../verifyContext";
import {IDocumentSymbols} from "../../src/parser/symbols/documentSymbols";
import {Token} from "../../src/parser/tokens/token";
import {asNumberLiteralToken} from "../../src/parser/tokens/numberLiteralToken";
import {Position} from "../../src/language/position";
import {SymbolKind} from "../../src/language/symbols/symbolKind";
import {Tokenizer} from "../../src/parser/tokens/tokenizer";
import {Line} from "../../src/parser/line";
import {TestFile} from "../testFile";
import {asMemberAccessToken} from "../../src/parser/tokens/memberAccessToken";
import {TokenizeResult} from "../../src/parser/tokens/tokenizeResult";
import {TokenList} from "../../src/parser/tokens/tokenList";
import {OperatorType} from "../../src/parser/tokens/operatorType";
import {asOperatorToken} from "../../src/parser/tokens/operatorToken";
import {replaceAll} from "../../src/infrastructure/replaceAll";

function number(token: Token): number {
  const numberLiteral = asNumberLiteralToken(token);
  if (numberLiteral == null || numberLiteral.isDecimal()) {
    throw new Error("Invalid number: " + token);
  }
  return numberLiteral.numberValue;
}

export interface IExpectedSymbol {
  verify(symbols: IDocumentSymbols, context: VerifyContext): boolean;
}

export class ExpectedNull implements IExpectedSymbol {

  private readonly lineNumber: number;
  private readonly columns: number[];

  constructor(lineNumber: number, columns: number[]) {
    this.lineNumber = lineNumber;
    this.columns = columns;
  }

  public static parse(tokens: readonly Token[]): IExpectedSymbol {

    const lineNumber = number(tokens[0]);
    const columns = tokens.slice(2).map(number);

    return new ExpectedNull(lineNumber, columns);
  }

  public verify(symbols: IDocumentSymbols, context: VerifyContext): boolean {
    let failed = false;
    for (let column of this.columns) {
      const symbolDescription = symbols.getDescription(new Position(this.lineNumber, column));
      context.isNull(symbolDescription, `Symbol at ${this.lineNumber}:${column}`);

      if (symbolDescription != null) {
        failed = true;
      }
    }
    return !failed;
  }
}

export class ExpectedSymbol implements IExpectedSymbol {

  private readonly lineNumber: number;
  private readonly column: number;
  private readonly name: string;
  private readonly kind: SymbolKind;
  private readonly description: string ;

  constructor(lineNumber: number, column: number, name: string, kind: SymbolKind, description: string) {
    this.lineNumber = lineNumber;
    this.column = column;
    this.name = name;
    this.kind = kind;
    this.description = description != null ? replaceAll(description,"\\n", "\n") : null;
  }

  public static parse(parseLineNumber: number, line: string): IExpectedSymbol {

    const parts = this.getTokens(parseLineNumber, line);

    if (parts.length <= 1) return null;

    if (parts[1].value.trim() == "null") {
      return ExpectedNull.parse(parts);
    }

    if (parts.length != 4 && parts.length != 5)  {
      throw new Error("Invalid values (4 or 5 expected): " + line);
    }

    const lineNumber = number(parts[0]);
    const column = number(parts[1]);
    const name = parts[2].value;
    const kind = this.parseSymbolKind(parts[3]);
    const description = parts.length > 4 ? parts[4].value : null;

    return new ExpectedSymbol(lineNumber, column, name, kind, description);
  }

  private static parseSymbolKind(token: Token): SymbolKind {
    const enumMember = asMemberAccessToken(token);
    if (enumMember == null || enumMember.parent != "SymbolKind") {
      throw new Error("Invalid SymbolKind: " + token);
    }
    return SymbolKind[enumMember.member];
  }

  private static getTokens(parseLineNumber: number, line: string): readonly  Token[] {
    const tokenizer = new Tokenizer();
    const tokenizeResult = tokenizer.tokenize(new Line(parseLineNumber, line, TestFile.instance));
    if (tokenizeResult.state != "success") {
      throw new Error(`Invalid line [${parseLineNumber}]: ${line}`);
    }

    const result: Token[] = [];
    const tokens = tokenizeResult.result;
    for (let index = 0; index < tokens.length; index += 2) {
      if (index < tokens.length - 1 && !this.isComma(tokens, index + 1)) {
          throw new Error("Comma expected at: " + tokens.get(index + 1).firstCharacter.position);
      }
      result.push(tokens.get(index));
    }
    return result;
  }

  private static isComma(tokens: TokenList, index: number): boolean {
    const operatorToken = asOperatorToken(tokens.get(index));
    return operatorToken != null
        && operatorToken.type == OperatorType.ArgumentSeparator;
  }

  public verify(symbols: IDocumentSymbols, context: VerifyContext): boolean {
    const extraMessage = `Symbol at (${this.lineNumber}:${this.column})`;
    const position = new Position(this.lineNumber, this.column);
    const symbolDescription = symbols.getDescription(position);

    context.isNotNull(symbolDescription, symbolContext => symbolContext
      .areEqual(symbol => symbol.name, this.name, extraMessage)
      .areEqual(symbol => symbol.kind, this.kind, extraMessage)
      .ifNotNull(this.description, descriptionContext => descriptionContext
        .areEqual(symbol => symbol.description, this.description, extraMessage)
      ),
      extraMessage
    );

    return symbolDescription != null
        && symbolDescription.name == this.name
        && symbolDescription.kind == this.kind
        && (this.description == null || symbolDescription.description == this.description);
  }
}
