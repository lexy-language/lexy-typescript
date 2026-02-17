import type {ISymbols} from "../../src/parser/symbols/symbols";
import {ComponentNodeList} from "../../src/language/componentNodeList";
import {StringSourceCodeDocument} from "../../src/parser/documents/stringSourceCodeDocument";
import {ISourceCodeDocument} from "../../src/parser/documents/ISourceCodeDocument";
import {createParser} from "../parseFunctions";

class SymbolsResult {

  public readonly symbols: ISymbols;
  public readonly nodes: ComponentNodeList;

  constructor(symbols: ISymbols, nodes: ComponentNodeList) {
    this.symbols = symbols;
    this.nodes = nodes;
  }
}

async function getDocumentsSymbols(documents: readonly ISourceCodeDocument[], suppressException: boolean = false): Promise<SymbolsResult> {

  const parser = createParser();
  const options = {suppressException: suppressException};

  try {
    const context = await parser.parseDocuments(documents, options);
    return new SymbolsResult(context.documentsSymbols, context.componentNodes);
  } catch (error: Error) {
    throw new Error("Parser error: \n" + logDocuments(documents) + "\n" + error.stack);
  }
}

function logDocuments(documents: readonly ISourceCodeDocument[]): string {

  let builder: string[] = [];
  for (const document of documents) {
    builder.push(document.toString());
  }
  return builder.join("");
}

export async function getSymbols(fileName: string, content: string, suppressException: boolean = false): Promise<SymbolsResult> {

  let lines = content.split("\n");
  let documents = [new StringSourceCodeDocument(lines, fileName)];

  return await getDocumentsSymbols(documents, suppressException);
}
