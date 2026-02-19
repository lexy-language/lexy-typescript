import type {ISymbols} from "../../src/parser/symbols/symbols";
import type {IDocumentSymbols} from "../../src/parser/symbols/documentSymbols";
import type {ISourceCodeDocument} from "../../src/parser/documents/ISourceCodeDocument";

import {ComponentNodeList} from "../../src/language/componentNodeList";
import {StringSourceCodeDocument} from "../../src/parser/documents/stringSourceCodeDocument";
import {createParser} from "../parseFunctions";
import {IProject, Project} from "../../src/infrastructure/project";
import {NodeFileSystem} from "../nodeFileSystem";
import {IFile} from "../../src/infrastructure/file";

class SymbolsResult {

  public readonly symbols: ISymbols;
  public readonly documentSymbols: IDocumentSymbols;
  public readonly nodes: ComponentNodeList;
  public readonly file: IFile;

  constructor(symbols: ISymbols, documentSymbols: IDocumentSymbols, nodes: ComponentNodeList, file: IFile) {
    this.symbols = symbols;
    this.documentSymbols = documentSymbols;
    this.nodes = nodes;
    this.file = file;
  }
}

export async function getSymbols(fileName: string, content: string, suppressException: boolean = false): Promise<SymbolsResult> {
  let lines = content.split("\n");
  return await getSymbolsLines(fileName, lines, suppressException);
}

export async function getSymbolsLines(fileName: string, lines: string[], suppressException: boolean = false): Promise<SymbolsResult> {

  let filesystem = new NodeFileSystem();
  let project = new Project(filesystem);
  let file = project.file(fileName);
  let document = new StringSourceCodeDocument(lines, file);

  return await getDocumentSymbols(project, document, suppressException);
}

export async function getSymbolsFile(file: IFile, suppressException: boolean = false): Promise<SymbolsResult> {

  let filesystem = new NodeFileSystem();
  let document = await filesystem.createFileSourceDocument(file);

  return await getDocumentSymbols(file.project, document, suppressException);
}

async function getDocumentSymbols(project: IProject, document: ISourceCodeDocument, suppressException: boolean = false): Promise<SymbolsResult> {

  const parser = createParser();
  const options = {suppressException: suppressException};
  const documents = [document];

  try {
    const context = await parser.parseDocuments(project, documents, options);
    const documentSymbol = context.symbols.document(document.file);
    return new SymbolsResult(context.symbols, documentSymbol, context.componentNodes, document.file);
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
