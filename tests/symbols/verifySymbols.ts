import {DocumentsSymbols} from "../../src/parser/symbols/documentsSymbols";
import {VerifyModelContext} from "../verifyModelContext";
import {SymbolKind} from "../../src/language/symbols/symbolKind";
import {Position} from "../../src/language/position";

export class VerifySymbols {

  private symbols: VerifyModelContext<DocumentsSymbols>;

  constructor(symbols: VerifyModelContext<DocumentsSymbols>) {
    this.symbols = symbols;
  }

  public description(lineNumber: number, column: number,
                     expectedName: string, expectedKind: SymbolKind, expectedDescription: string = null): VerifySymbols {

    let extraMessage = `Symbol at (${lineNumber}:${column})`;
    let position = new Position(lineNumber, column);

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
