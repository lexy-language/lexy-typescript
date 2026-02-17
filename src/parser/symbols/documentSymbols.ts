import type {IParsableNode} from "../../language/parsableNode";
import type {INode} from "../../language/node";
import type {IComponentNode} from "../../language/componentNode";

import {Assert} from "../../infrastructure/assert";
import {Line} from "../line";
import {Position} from "../../language/position";
import {Signatures} from "../../language/symbols/signatures";
import {Symbol} from "../../language/symbols/symbol";
import {Token} from "../tokens/token";
import {SymbolDescription} from "./SymbolDescription";

type ReturnValue = {value: Symbol | null};

export interface IDocumentSymbols {
  add(line: Line): void;
  addNode(componentNode: IComponentNode): void;
}

export class DocumentSymbols implements IDocumentSymbols {

  private readonly lexyScriptNode: INode;
  private readonly nodes: INode[] = [];
  private lines = new Array<Line>(32);

  constructor(lexyScriptNode: INode) {
    this.lexyScriptNode = Assert.notNull(lexyScriptNode, "lexyScriptNode");
  }

  public getDescription(position: Position): SymbolDescription | null {
    return DocumentSymbols.mapDescription(this.getNode(position));
  }

  public getSignatures(position: Position ): Signatures | null {
    return DocumentSymbols.mapSignatures(this.getNode(position));
  }

  public addNode(parsedNode: IParsableNode): void {
    this.nodes.push(parsedNode);
  }

  public add(line: Line): void {
    if (line.index >= this.lines.length) {
      this.lines.length = this.lines.length + 32;
    }

    Assert.true(line.index < this.lines.length, "Lines should be added sequentially");

    this.lines[line.index] = line;
  }

  private static mapDescription(symbol: Symbol | null): SymbolDescription | null {
    if (symbol == null) return null;
    return new SymbolDescription(symbol.name, symbol.description, symbol.kind);
  }

  private static mapSignatures(symbol: Symbol | null): Signatures | null {
    if (symbol == null) return null;
    throw new Error("not implemented");
  }

  private getNode(position: Position): Symbol | null {
    const previous: ReturnValue | null = {value: null};
    const symbol = DocumentSymbols.getSymbol(position, this.nodes, previous);
    console.log(`>>>>>: (${position}) - ${symbol}`);
    return symbol?.value ?? previous.value;
  }

  private static getSymbol(position: Position, list: readonly INode[], previousSymbol: ReturnValue): ReturnValue | null {

    for (const node of list) {
      //console.log(`Check: (${position}) between '${previousSymbol.value?.reference}' and '${node.reference}'`);
      if (node.reference.lineNumber > position.lineNumber) {
        return previousSymbol;
      }

      if (node.reference.lineNumber == position.lineNumber && node.reference.column > position.column) {
        return previousSymbol;
      }

      if (node.reference.includes(position)) {
        const symbol = node.getSymbol();
        if (symbol != null) {
          previousSymbol.value = symbol;
        }
      }

      const childSymbol = this.getSymbol(position, node.getChildren(), previousSymbol);
      if (childSymbol != null) return childSymbol;
    }

    return null;
  }

  public getNodesInScope(position: Position ): INode[] {
    const nodesInScope: (INode[])[] = [];
    DocumentSymbols.getNodesInScopeNodes(position, this.nodes, nodesInScope);

    return nodesInScope.length == 0
      ? [this.lexyScriptNode]
      : DocumentSymbols.flatten(nodesInScope);
  }

  private static flatten(nodesInScope: (INode[])[]): INode[] {
    const result: INode[] = [];
    for (let level = 0; level < nodesInScope.length; level++) {
      for (const node of nodesInScope[level]) {
        result.push(node);
      }
    }
    return result;
  }

  private static getNodesInScopeNodes(position: Position, list: readonly INode[],
                                      nodesInScope: (INode[])[]): void {
    let wasIn = false;
    let precedingNodes: INode[] = [];
    for (const node of list) {

      const inNode = node.area.includes(position);

      if (wasIn && !inNode) return;

      if (nodesInScope.length > 0) {
        precedingNodes.push(node);
      }

      if (inNode) {
        if (nodesInScope.length == 0) {
          precedingNodes.push(node);
        }

        nodesInScope.push(precedingNodes);
        this.getNodesInScopeNodes(position, node.getChildren(), nodesInScope);
        wasIn = true;
      }
    }
  }

  public getToken(position: Position): Token | null {

    Assert.notNull(position, "position");
    Assert.true(this.lines.length >= position.lineNumber, `Couldn't find line: ${position.lineNumber} Lines: ${this.lines.length}`);

    const line = this.lines[position.lineNumber - 1];
    Assert.notNull(line, `Couldn't find line: ${position.lineNumber} Lines: ${this.lines.length}`);

    return line.tokens.tokenAt(position.column);
  }
}
