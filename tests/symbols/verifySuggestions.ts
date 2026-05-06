import {Assert} from "../../src";
import {VerifyContext} from "../verifyContext";
import {SymbolKind} from "../../src/language/symbols/symbolKind";
import {SuggestionsResult} from "../../src/parser/symbols/SuggestionsResult";
import {Position} from "../../src/language/position";
import {Suggestion} from "../../src/language/symbols/suggestion";
import {VerifyMultipleSuggestion} from "./verifyMultipleSuggestion";
import {Verify} from "../verify";
import {getSymbols} from "./getSymbols";
import {firstOrDefault} from "../../src/infrastructure/arrayFunctions";

export async function verifySuggestions(handler: (context: VerifySuggestions) => Promise<void>): Promise<void> {
  await Verify.allAsync(async context => await handler(new VerifySuggestions(context)));
}

export class VerifySuggestions {

  private readonly context: VerifyContext;
  private index: number = 0;

  constructor(context: VerifyContext) {
    this.context = Assert.notNull(context, "context");
  }

  public async keyword(code: string, lineNumber: number, column: number, name: string): Promise<void> {
    await this.checkSuggestion(code, lineNumber, column, SymbolKind.Keyword, name, "keyword");
  }

  public async parameter(code: string, lineNumber: number, column: number, name: string, description: string): Promise<void> {
    await this.checkSuggestion(code, lineNumber, column, SymbolKind.ParameterVariable, name, description);
  }

  public async result(code: string, lineNumber: number, column: number, name: string, description: string): Promise<void> {
    await this.checkSuggestion(code, lineNumber, column, SymbolKind.ResultVariable, name, description);
  }

  public async suggestion(code: string, lineNumber: number, column: number, testHandler: (suggestions: VerifyMultipleSuggestion) => void): Promise<void> {

    const result = await this.getSuggestions(code, lineNumber, column);

    const verifyMultipleSuggestion = new VerifyMultipleSuggestion(this.context, result, testHandler, this.index++);
    verifyMultipleSuggestion.verify();
  }

  private async getSuggestions(code: string, lineNumber: number, column: number): Promise<SuggestionsResult> {

    const result = await getSymbols(`test.${this.index}.lexy`, code, true);
    return result.symbols.getSuggestions(result.file, new Position(lineNumber, column));
  }

  private async checkSuggestion(code: string, lineNumber: number, column: number, kind: SymbolKind, name: string, description: string | null) {

    const result = await this.getSuggestions(code, lineNumber, column);

    const message = `All:\n${VerifySuggestions.format(result.all)}\nFiltered:\n${VerifySuggestions.format(result.filtered)}`;
    const assertionMessage = `${this.index++}: ${name} - ${kind} (${description})\n\n${message}`;
    const element = firstOrDefault(result.filtered, value => value.name == name);

    if (element == null) {
      this.context.fail("Element not found: " + assertionMessage);
      return this;
    }

    this.context
      .isTrue(element.kind == kind, "Suggestion: " + element + "\n" + assertionMessage)
      .isTrue(element.description == description, "Suggestion: " + element + "\n" + assertionMessage);

    return this;
  }

  private static format(suggestions: Suggestion[]): string {

    const writer = [];
    for (const suggestion of suggestions) {
      writer.push("  - " + suggestion + "\n");
    }
    return writer.join("");
  }
}
