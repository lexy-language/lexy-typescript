import {SymbolKind} from "../../src/language/symbols/symbolKind";
import {VerifyContext} from "../verifyContext";
import {SuggestionsResult} from "../../src/parser/symbols/SuggestionsResult";
import {Assert} from "../../src";
import {Suggestion} from "../../src/language/symbols/suggestion";
import {firstOrDefault} from "../../src/infrastructure/arrayFunctions";

class Assertion {

  public readonly name: string;
  public readonly description: string;
  public readonly kind: SymbolKind;
  public readonly negate: boolean;

  constructor(name: string, description: string, kind: SymbolKind, negate: boolean = false) {
    this.name = name;
    this.description = description;
    this.kind = kind;
    this.negate = negate;
  }

  public toString() {
    return this.negate
      ? `'${this.name}' (${this.kind}) '${this.description}'`
      : `not '${this.name}'`
  }
}

export class VerifyMultipleSuggestion {

  private readonly parentContext: VerifyContext;
  private readonly assertions: Assertion[] = [];
  private readonly resultValue: SuggestionsResult;
  private readonly testHandler: (verify: VerifyMultipleSuggestion) => void;
  private readonly parentIndex: number;

  private index: number = 0;

  constructor(parentContext: VerifyContext, result: SuggestionsResult,
              testHandler: (verify: VerifyMultipleSuggestion) => void, parentIndex: number) {

    this.parentContext = Assert.notNull(parentContext, "parentContext");
    this.resultValue = Assert.notNull(result, "result");
    this.testHandler = Assert.notNull(testHandler, "testHandler");
    this.parentIndex = parentIndex;
  }

  public keyword(name: string): VerifyMultipleSuggestion {
    return this.verifySuggestion(name, SymbolKind.Keyword, "keyword");
  }

  public notKeyword(name: string): VerifyMultipleSuggestion {
    return this.verifySuggestionNot(name, SymbolKind.Keyword);
  }

  public parameter(name: string, description: string): VerifyMultipleSuggestion {
    return this.verifySuggestion(name, SymbolKind.ParameterVariable, description);
  }

  public result(name: string, description: string): VerifyMultipleSuggestion {
    return this.verifySuggestion(name, SymbolKind.ResultVariable, description);
  }

  public variable(name: string, description: string): VerifyMultipleSuggestion {
    return this.verifySuggestion(name, SymbolKind.Variable, description);
  }

  public objectVariable(name: string, description: string): VerifyMultipleSuggestion {
    return this.verifySuggestion(name, SymbolKind.ObjectVariable, description);
  }

  private verifySuggestion(name: string, kind: SymbolKind, description: string | null): VerifyMultipleSuggestion {
    this.assertions.push(new Assertion(name, description, kind));
    return this;
  }

  private verifySuggestionNot(name: string, kind: SymbolKind): VerifyMultipleSuggestion {
    this.assertions.push(new Assertion(name, null, kind, true));
    return this;
  }

  public verify(): void {
    this.testHandler(this);

    let message = `All:\n${VerifyMultipleSuggestion.format(this.resultValue.all)}\nFiltered:\n${VerifyMultipleSuggestion.format(this.resultValue.filtered)}`;

    for (const assertion of this.assertions) {
      this.verifyAssertion(assertion, message);
    }
  }

  private verifyAssertion(assertion: Assertion, message: string) {
    const assertionMessage = `${this.parentIndex}.${this.index++}: ${assertion}\n\n${message}`;
    const element = firstOrDefault(this.resultValue.filtered, value => value.name == assertion.name);

    if (assertion.negate) {
      this.parentContext.isTrue(element == null, "Element not found but shouldn't: " + assertion.name + "\n" + assertionMessage);
      return;
    }

    if (element == null) {
      this.parentContext.fail(" - Element not found: " + assertion.name + "\n" + assertionMessage);
      return;
    }

    this.parentContext
      .isTrue(element.kind == assertion.kind, "Element kind not correct: " + element + "\n" + assertion.name + "\n" + assertionMessage)
      .isTrue(element.description == assertion.description, "Element description not correct: " + element + "\n" + assertion.description + "\n" + assertionMessage);
  }

  private static format(suggestions: readonly Suggestion[]): string {
    let writer = [];
    for (const suggestion of suggestions) {
      writer.push("  - " + suggestion);
    }
    return writer.join("\n");
  }
}
