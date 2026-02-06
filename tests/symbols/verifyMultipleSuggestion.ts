import {SymbolKind} from "../../src/language/symbols/symbolKind";
import {VerifyContext} from "../verifyContext";
import {SuggestionsResult} from "../../src/parser/symbols/SuggestionsResult";
import {Assert} from "../../src";
import {Suggestion} from "../../src/language/symbols/suggestion";
import {VerifyCollectionContext} from "../verifyCollectionContext";

class Assertion {

  public readonly name: string;
  public readonly kind: SymbolKind;
  public readonly negate: boolean;

  constructor(name: string, kind: SymbolKind, negate: boolean = false) {
    this.name = name;
    this.kind = kind;
    this.negate = negate;
  }
}

export class VerifyMultipleSuggestion {

  private readonly parentContext: VerifyContext;
  private readonly assertions: Assertion[] = [];
  private readonly resultValue: SuggestionsResult;
  private readonly testHandler: (verify: VerifyMultipleSuggestion) => void;
  private readonly parentIndex: number;

  private index: number;

  constructor(parentContext: VerifyContext, result: SuggestionsResult,
              testHandler: (verify: VerifyMultipleSuggestion) => void, parentIndex: number) {

    this.parentContext = Assert.notNull(parentContext, "parentContext");
    this.resultValue = Assert.notNull(result, "result");
    this.testHandler = Assert.notNull(testHandler, "testHandler");
    this.parentIndex = parentIndex;
  }

  public keyword(name: string): VerifyMultipleSuggestion {
    return this.verifySuggestion(name, SymbolKind.Keyword);
  }

  public notKeyword(name: string): VerifyMultipleSuggestion {
    return this.verifySuggestionNot(name, SymbolKind.Keyword);
  }

  public parameter(name: string): VerifyMultipleSuggestion {
    return this.verifySuggestion(name, SymbolKind.ParameterVariable);
  }

  public result(name: string): VerifyMultipleSuggestion {
    return this.verifySuggestion(name, SymbolKind.ResultVariable);
  }

  public variable(name: string): VerifyMultipleSuggestion {
    return this.verifySuggestion(name, SymbolKind.Variable);
  }

  public objectVariable(name: string): VerifyMultipleSuggestion {
    return this.verifySuggestion(name, SymbolKind.ObjectVariable);
  }

  private verifySuggestion(name: string, kind: SymbolKind): VerifyMultipleSuggestion {
    this.assertions.push(new Assertion(name, kind));
    return this;
  }

  private verifySuggestionNot(name: string, kind: SymbolKind): VerifyMultipleSuggestion {
    this.assertions.push(new Assertion(name, kind, true));
    return this;
  }

  public verify(): void {
    this.testHandler(this);

    let message = `All:\n${VerifyMultipleSuggestion.format(this.resultValue.all)}\nFiltered:\n${VerifyMultipleSuggestion.format(this.resultValue.filtered)}`;

    this.parentContext.collection(this.resultValue.filtered, verifySuggestions => {
      for (const assertion of this.assertions) {
        this.verifyAssertion(assertion, message, verifySuggestions);
      }
    });
  }

  private criteria(assertion: Assertion): (suggestion: Suggestion) => boolean {
    return value => value.name == assertion.name && value.kind == assertion.kind;
  }

  private verifyAssertion(assertion: Assertion, message: string, verifySuggestions: VerifyCollectionContext<Suggestion>) {
    let assertionMessage = `${this.parentIndex}.${this.index++}: ${assertion}\n\n${message}`;
    if (!assertion.negate) {
      verifySuggestions.any(this.criteria(assertion), assertionMessage);
    } else {
      verifySuggestions.none(this.criteria(assertion), assertionMessage);
    }
  }

  private static format(suggestions: readonly Suggestion[]): string {
    let writer = [];
    for (const suggestion of suggestions) {
      writer.push("  - " + suggestion);
    }
    return writer.toString();
  }
}
