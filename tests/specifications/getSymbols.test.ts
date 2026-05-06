import type {INode} from "../../src/language/node";
import type {IFileSystem} from "../../src";
import type {IFile} from "../../src/infrastructure/file";
import type {ISymbols} from "../../src/parser/symbols/symbols";
import type {IDocumentSymbols} from "../../src/parser/symbols/documentSymbols";

import {NodeFileSystem} from "../nodeFileSystem";
import {IProject, Project} from "../../src/infrastructure/project";
import {VerifyContext} from "../verifyContext";
import {Verify} from "../verify";
import {ComponentNodeList} from "../../src/language/componentNodeList";
import {NodesLogger} from "../../src/parser/logging/nodesLogger";
import {ExpectedSymbol} from "./expectedSymbol";
import {Symbol} from "../../src/language/symbols/symbol";
import {SourceReference} from "../../src/language/sourceReference";
import {getSymbolsFile} from "../symbols/getSymbols";
import {replaceAll} from "../../src/infrastructure/replaceAll";

class CodeRange {

  private readonly symbol: Symbol ;
  private readonly options: number[] = [];
  private readonly lineNumber: number;

  constructor(symbol: Symbol) {
    this.symbol = symbol;
    this.lineNumber = symbol.reference.lineNumber;

    for (let index = symbol.reference.column; index <= symbol.reference.endColumn; index++) {
      this.options.push(index);
    }
  }

  public random(): number | null {
    if (this.options.length == 0) {
      throw new Error("No reference options: line: " + this.lineNumber);
    }

    const index = Math.random() * (this.options.length - 1);
    return this.options[index];
  }

  public subtract(reference: SourceReference): void {

    if (reference.lineNumber != this.lineNumber) return;

    for (let index = reference.column; index <= reference.endColumn; index++) {
      const found = this.options.indexOf(index);
      if (found >= 0) {
        this.options.splice(found, 1);
      }
    }
  }
}

describe('GetSymbolsTests', () => {

  const fileSystem: IFileSystem = new NodeFileSystem();
  const baseFolder: string = "lexy-language/Specifications/Symbols/";
  const project: IProject = createProject();

  function createProject() {
    return new Project(fileSystem, baseFolder);
  }

  it('AllKeywords', async() => {
    await verify("AllKeywords.lexy")
  });

  it('Enum', async() => {
    await verify("Enum.lexy")
  });

  it('Function', async() => {
    await verify("Function.lexy")
  });

  it('Table', async() => {
    await verify("Table.lexy")
  });

  it('Type', async() => {
    await verify("Type.lexy")
  });

  it('SystemFunctions', async() => {
    await verify("SystemFunctions.lexy")
  });
  
  async function verify(fileName: string) {
    const file = project.file(fileName);
    await Verify.allAsync(async context => await verifyCaseFile(context, file));
  }

  async function verifyCaseFile(context: VerifyContext, file: IFile) {

    context.log("File: " + file.name);

    const result = await getSymbolsFile(file);

    await verifyNodes(context, result.file, result.nodes);
    await verifySymbols(context, result.file, result.symbols);
  }

  async function verifyNodes(context: VerifyContext, file: IFile, nodes: ComponentNodeList) {

    context.log("> Nodes:");

    const nodesLogFile = replaceAll(file.fullPath, ".lexy", ".nodes");
    const nodesLog = await readNodesLog(context, nodesLogFile);
    const {failed, log} = verifyNodesFile(context, nodes, nodesLog);

    if (failed) {
      const expectedFileName = nodesLogFile + ".actual";
      await fileSystem.writeAllLines(expectedFileName, log);
      context.log(`  - Expected saved: ${expectedFileName}`);
    }
  }

  async function readNodesLog(context: VerifyContext, nodesLogFile: string): Promise<string[]>  {

    if (await fileSystem.fileExists(nodesLogFile)) {
      return (await fileSystem.readAllLines(nodesLogFile)).filter(value => value != null && value != "");
    }

    context.fail(`\n  - File not found: ` + nodesLogFile);
    return [];
  }

  function verifyNodesFile(context: VerifyContext, nodes: ComponentNodeList, nodesLog: string[]): {failed: boolean, log: string[]} {

    const log: string[] = [];

    NodesLogger.log(nodes.values, value => log.push(value));

    let failed = false;
    for (let index = 0; index < nodesLog.length; index++) {
      if (verifyNode(context, nodesLog, index, log)) {
        failed = true;
      }
    }

    if (nodesLog.length != log.length) {
      context.fail(`\n  - Invalid node log length: Actual: ${log.length} Expected: ${nodesLog.length}`);
      return {failed: true, log};
    }

    return {failed: failed, log};
  }

  function verifyNode(context: VerifyContext, nodesLog: string[], index: number, log: string[]): boolean {

    const expectedLog = nodesLog[index];
    const actualLog = index < log.length ? log[index] : "";

    if (expectedLog != actualLog) {
      context.fail(`\n  - Invalid node log: ${index}\n    Expect: ${expectedLog}\n    Actual: ${actualLog}`);
      return true;
    }

    return false;
  }

  async function verifySymbols(context: VerifyContext, file: IFile, symbols: ISymbols) {

    context.log("> Symbols:");

    const documentSymbols = symbols.document(file);

    const expectedSymbolsFile = replaceAll(file.fullPath, ".lexy", ".symbols");
    const expectedSymbolsLines = await readSymbolsFile(context, expectedSymbolsFile);

    const failed = expectedSymbolsLines == null || verifySymbolsLog(context, expectedSymbolsLines, documentSymbols);

    if (failed) {
      context.log("\n  - Invalid symbols");

      const expectedFileName = expectedSymbolsFile + ".actual";
      const expectedSymbols = createSymbols(documentSymbols);

      await fileSystem.writeAllLines(expectedFileName, expectedSymbols);

      context.log("  - Expected saved: " + expectedFileName);
    }
  }

  function verifySymbolsLog(context: VerifyContext,
                            expectedSymbolsLines: string[],
                            documentSymbols: IDocumentSymbols): boolean {

    let failed = false;
    for (let index = 0; index < expectedSymbolsLines.length; index++){
      const expectedSymbolsLine = expectedSymbolsLines[index];
      const expectedSymbol = ExpectedSymbol.parse(index, expectedSymbolsLine);
      if (expectedSymbol != null && !expectedSymbol.verify(documentSymbols, context)) {
        failed = true;
      }
    }
    return failed;
  }

  async function readSymbolsFile(context: VerifyContext, expectedSymbolsFile: string): Promise<string[]> {

    if (!await fileSystem.fileExists(expectedSymbolsFile)) {
      context.fail(`\n  - File not found: ` + expectedSymbolsFile);
      return null;
    }
    return await fileSystem.readAllLines(expectedSymbolsFile);
  }

  function createSymbols(symbols: IDocumentSymbols): string[] {

    const log: string[] = [];
    symbols.walkSymbols((node, symbol) => {
      const lineNumber = symbol.reference.lineNumber;
      const column = getRandomColumnNumberInSymbolRange(node, symbol);
      if (column == null) return;

      const label = symbol.name;
      const description = symbol.description;
      const expected = description == null || description == ""
          ? `${lineNumber}, ${column}, \"${escape(label)}\", SymbolKind.${symbol.kind}`
          : `${lineNumber}, ${column}, \"${escape(label)}\", SymbolKind.${symbol.kind}, \"${escape(description)}\"`;

      log.push(expected);
    });

    return log;
  }

  function escape(value: string ) {
    value = replaceAll(value, "\n", "\\n");
    value = replaceAll(value, "\\", "\\\\")
    return  replaceAll(value, "\"", "\\\"");
  }

  function getRandomColumnNumberInSymbolRange(node: INode, symbol: Symbol): number | null {
    const range = new CodeRange(symbol);
    subtractChildrenRangeFromSymbolRange(range, node.getChildren());
    return range.random();
  }

  function subtractChildrenRangeFromSymbolRange(range: CodeRange, children: INode[]) {
    for (let child of children) {
      if (child.getSymbol() != null) {
        range.subtract(child.reference);
      }
      subtractChildrenRangeFromSymbolRange(range, child.getChildren());
    }
  }
});
