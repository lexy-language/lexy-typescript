import {SymbolKind} from "../../language/symbols/symbolKind"

export class SymbolReference {
  public readonly lineNumber: number;
  public readonly column: number;
  public readonly endColumn: number;

  constructor(lineNumber: number, column: number, endColumn: number) {
    this.lineNumber = lineNumber
    this.column = column
    this.endColumn = endColumn
  }
}

export class DocumentSymbol {
  public readonly name: string
  public readonly description: string;
  public readonly kind: SymbolKind;
  public readonly reference: SymbolReference;
  public readonly children: DocumentSymbol[];

  constructor(name: string, description: string, kind: SymbolKind, reference: SymbolReference, children: DocumentSymbol[]) {
    this.name = name
    this.description = description
    this.kind = kind
    this.reference = reference
    this.children = children
  }
}
