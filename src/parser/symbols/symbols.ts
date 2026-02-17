import {INode} from "../../language/node";
import {VariableEntry} from "../../language/variableEntry";
import {LexyScriptNode} from "../../language/lexyScriptNode";
import {Assert} from "../../infrastructure/assert";
import {Position} from "../../language/position";
import {SymbolDescription} from "./SymbolDescription";
import {Signatures} from "../../language/symbols/signatures";
import {SuggestionsResult} from "./SuggestionsResult";
import {Suggestion} from "../../language/symbols/suggestion";
import {Token} from "../tokens/token";
import {asMemberAccessToken} from "../tokens/memberAccessToken";
import {firstOrDefault, where} from "../../infrastructure/arrayFunctions";
import {SymbolKind} from "../../language/symbols/symbolKind";
import {IObjectMember, ObjectMemberKind} from "../../language/typeSystem/objects/objectMember";
import {IdentifierPath} from "../../language/identifierPath";
import {asObjectType} from "../../language/typeSystem/objects/objectType";
import {VariableSource} from "../../language/variableSource";
import {SuggestionEdit} from "../../language/symbols/suggestionEdit";
import {SuggestionsScope} from "../../language/symbols/suggestionsScope";
import {DocumentSymbols, IDocumentSymbols} from "./documentSymbols";
import {asIncompleteMemberAccessToken} from "../tokens/incompleteMemberAccessToken";

export interface ISymbols {
  getDescription(fileName: string, position: Position): SymbolDescription | null;
  getSignatures(fileName: string, position: Position): Signatures | null;
  getSuggestions(fileName: string, position: Position): SuggestionsResult;

  document(fullFileName: string): IDocumentSymbols;

  addNodeVariables(node: INode, result: readonly VariableEntry[]): void;
}

export class Symbols implements ISymbols {

  private readonly symbols: Map<string, DocumentSymbols> = new Map();
  private readonly nodeVariables: Map<INode, readonly VariableEntry[]> = new Map();
  private readonly lexyScriptNode: LexyScriptNode;

  constructor(lexyScriptNode: LexyScriptNode) {
    this.lexyScriptNode = Assert.notNull(lexyScriptNode, "lexyScriptNode");
  }

  public addNodeVariables(node: INode, result: readonly VariableEntry[]): void {
    this.nodeVariables.set(node, result);
  }

  public getDescription(fileName: string, position: Position): SymbolDescription | null {
    const document = this.getDocumentSymbols(fileName);
    if (document == null) {
      throw new Error(`Couldn't find document: ${fileName}`);
    }

    return document.getDescription(position);
  }

  public getSignatures(fileName: string, position: Position): Signatures | null {
    const document = this.getDocumentSymbols(fileName);
    if (document == null) {
      throw new Error(`Couldn't find document: ${fileName}`);
    }

    return document.getSignatures(position);
  }

  public getSuggestions(fileName: string, position: Position): SuggestionsResult {
    const document = this.getDocumentSymbols(fileName);
    if (document == null) {
      throw new Error(`Couldn't find document: ${fileName}`);
    }

    const token = document.getToken(position);
    if (token == null || token.value == "") {
      return new SuggestionsResult();
    }

    const nodesInScope = document.getNodesInScope(position);
    const result: Suggestion[] = [];
    //        result.AddRange(AddLocalVariables(document, position));
    //        result.AddRange(AddComponentsAndMembers(document, position));
    //        result.AddRange(AddLibraryFunctions(document, position));
    this.addVariables(nodesInScope, result);
    Symbols.addNodesSuggestions(nodesInScope, result, position.addEndColumn(-1));

    const filter = Symbols.filter(result, token);

    return new SuggestionsResult(filter, result, token.value);
  }

  private static filter(result: Suggestion[], token: Token): Suggestion[] {
    const memberAccessToken = asMemberAccessToken(token);
    if (memberAccessToken != null) {
      return this.filterMemberAccess(result, memberAccessToken.parts);
    }
    const incompleteMemberAccessToken = asIncompleteMemberAccessToken(token);
    if (incompleteMemberAccessToken != null) {
      return this.filterMemberAccess(result, incompleteMemberAccessToken.parts);
    }
    return where(result, value => value.name.startsWith(token.value));
  }

  private static filterMemberAccess(result: Suggestion[], parts: string[]): Suggestion[] {
    const members = this.getMembers(result, parts);
    if (members == null) {
      return [];
    }

    function mapDescription(member: IObjectMember) {
      switch (member.kind) {
        case ObjectMemberKind.Function:
          return `function: ${member.type}`;
        case ObjectMemberKind.Variable:
          return `variable: ${member.type}`;
        case ObjectMemberKind.NestedType:
          return `type: ${member.type}`;
      }
    }

    return members.map(member => new Suggestion(member.name, mapDescription(member), SymbolKind.ObjectVariable, member.type));
  }

  private static getMembers(result: Suggestion[], parts: string[]): IObjectMember[] | null {
    let path = IdentifierPath.parse(parts);
    const suggestion = firstOrDefault(result, value => value.name == path.rootIdentifier);
    if (suggestion?.type == null) {
      return null;
    }

    let type = asObjectType(suggestion.type);
    if (type == null) {
      return null;
    }

    while (path.path.length >= 3) {
      path = path.childrenPath();
      if (path.rootIdentifier == "") break;

      type = asObjectType(type.memberType(path.rootIdentifier));
      if (type == null) {
        return null;
      }
    }

    path = path.hasChildIdentifiers ? path.childrenPath() : path;

    return path.rootIdentifier == ""
      ? type.members
      : where(type.members, member => member.name.startsWith(path.rootIdentifier));
  }

  private addLocalVariables(document: DocumentSymbols, position: Position): Suggestion {
    throw new Error();
  }

  private addComponentsAndMembers(document: DocumentSymbols, position: Position): Suggestion {
    throw new Error();
  }

  private addLibraryFunctions(document: DocumentSymbols, position: Position): Suggestion[] {
    throw new Error();
  }

  private addVariables(nodesInScope: INode[], result: Suggestion[]): void {

    for (const node of nodesInScope) {

      const variables = this.nodeVariables.get(node);
      if (variables == undefined) continue;

      variables.forEach(value => result.push(Symbols.map(value)));
    }
  }

  private static map(entry: VariableEntry): Suggestion {
    const kind = this.getKind(entry.variableSource);
    const description = entry.toString();
    return new Suggestion(entry.name, description, kind, entry.type);
  }

  private static getKind(source: VariableSource) {
    switch (source) {
      case VariableSource.Parameters:
        return SymbolKind.ParameterVariable;
      case VariableSource.Results:
        return SymbolKind.ResultVariable;
      case VariableSource.Code:
        return SymbolKind.Variable;
      case VariableSource.Type:
        return SymbolKind.ObjectVariable;
      default:
        throw new Error(`VariableSource: ${source}`)
    }
  }

  private static addNodesSuggestions(nodes: INode[], suggestions: Suggestion[], position: Position): void {
    for (let index = nodes.length - 1; index >= 0; index--) {
      const node = nodes[index];
      const nodeSuggestions = node.getSuggestions();
      Symbols.addSuggestions(suggestions, nodeSuggestions, node, position);
    }
  }

  private static addSuggestions(suggestions: Suggestion[], nodeSuggestions: readonly SuggestionEdit[] | null, node: INode, position: Position) {

    if (nodeSuggestions == null) return;

    for (const suggestion of nodeSuggestions) {
      if (suggestion.scope == SuggestionsScope.Children
        || suggestion.scope == SuggestionsScope.CurrentLevel && node.area.includes(position)) {
        suggestion.update(suggestions);
      }
    }
  }

  private getDocumentSymbols(fileName: string): DocumentSymbols | null {
    const value = this.symbols.get(fileName);
    return value != undefined ? value : null;
  }

  public document(fullFileName: string): DocumentSymbols {

    const value = this.symbols.get(fullFileName);
    if (value != undefined) {
      return value;
    }

    const documentSymbols = new DocumentSymbols(this.lexyScriptNode);
    this.symbols.set(fullFileName, documentSymbols);
    return documentSymbols;
  }
}
