import type {ISymbols} from "../../src/parser/symbols/symbols";

import {VerifyModelContext} from "../verifyModelContext";
import {SymbolKind} from "../../src/language/symbols/symbolKind";
import {Position} from "../../src/language/position";

export class VerifySymbols {

  private symbols: VerifyModelContext<ISymbols>;

  constructor(symbols: VerifyModelContext<ISymbols>) {
    this.symbols = symbols;
  }

  public description(lineNumber: number, column: number,
                     expectedName: string, expectedKind: SymbolKind, expectedDescription: string = null): VerifySymbols {

    const extraMessage = `Symbol at (${lineNumber}:${column})`;
    const position = new Position(lineNumber, column);

    this.symbols.isNotNull(model => model.getDescription("test.lexy", position), modelContext => modelContext
        .areEqual(description => description.name, expectedName, extraMessage)
        .areEqual(description => description.kind, expectedKind, extraMessage)
        .ifNotNull(expectedDescription, descriptionContext => descriptionContext
          .areEqual(description => description.description, expectedDescription, extraMessage)
        ),
      extraMessage
    );

    return this;
  }

  public verifyDescriptionNull(lineNumber: number, columns: number[]): VerifySymbols {

    for (const column of columns) {
      this.symbols.isNull(model => model
        .getDescription("test.lexy", new Position(lineNumber, column)), `Symbol at ${lineNumber}:${column}`);
    }

    return this;
  }
}
