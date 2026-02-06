import {Assert} from "../../src";
import {VerifyContext} from "../verifyContext";
import {SymbolKind} from "../../src/language/symbols/symbolKind";
import {SuggestionsResult} from "../../src/parser/symbols/SuggestionsResult";
import {Position} from "../../src/language/position";
import {Suggestion} from "../../src/language/symbols/suggestion";
import {VerifyMultipleSuggestion} from "./verifyMultipleSuggestion";
import {Verify} from "../verify";
import {getSymbols} from "./getSymbols";

export async function verifySuggestions(handler: (context: VerifySuggestions) => Promise<void>): Promise<void> {
  await Verify.allAsync(async context => await handler(new VerifySuggestions(context)));
}

export class VerifySuggestions {

  private readonly context: VerifyContext;
  private index: number;

  constructor(context: VerifyContext) {
    this.context = Assert.notNull(context, "context");
  }

  public async keyword(code: string, lineNumber: number, column: number, name: string): Promise<void> {
    await this.checkSuggestion(code, lineNumber, column, SymbolKind.Keyword, name);
  }

  public async parameter(code: string, lineNumber: number, column: number, name: string): Promise<void> {
    await this.checkSuggestion(code, lineNumber, column, SymbolKind.ParameterVariable, name);
  }

  public async result(code: string, lineNumber: number, column: number, name: string): Promise<void> {
    await this.checkSuggestion(code, lineNumber, column, SymbolKind.ResultVariable, name);
  }

  public async suggestion(code: string, lineNumber: number, column: number, testHandler: (suggestions: VerifyMultipleSuggestion) => void): Promise<void> {

    const result = await this.getSuggestions(code, lineNumber, column);

    let verifyMultipleSuggestion = new VerifyMultipleSuggestion(this.context, result, testHandler, this.index++);
    verifyMultipleSuggestion.verify();
  }

  private async getSuggestions(code: string, lineNumber: number, column: number): Promise<SuggestionsResult> {

    const symbols = await getSymbols("test.{index}.lexy", code, true);
    return symbols.symbols.getSuggestions("test.{index}.lexy", new Position(lineNumber, column));
  }

  private async checkSuggestion(code: string, lineNumber: number, column: number, kind: SymbolKind, name: string) {

    let result = await this.getSuggestions(code, lineNumber, column);

    let message = `All:\n${VerifySuggestions.format(result.all)}\nFiltered:\n${VerifySuggestions.format(result.filtered)}`;
    let assertionMessage = `${this.index++}: ${name} - ${kind}\n\n${message}`;

    this.context.collection(result.filtered, verifySuggestions => verifySuggestions
      .any(value => value.name == name && value.kind == kind, assertionMessage));

    return this;
  }

  private static format(suggestions: Suggestion[]): string {

    let writer = [];
    for (const suggestion of suggestions) {
      writer.push("  - " + suggestion + "\n");
    }
    return writer.join("");
  }
}
