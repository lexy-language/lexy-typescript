import type {IRootNode} from "../language/rootNode";
import type {INode} from "../language/node";
import type {ILogger} from "../infrastructure/logger";

import {SourceReference} from "./sourceReference";
import {any, where} from "../infrastructure/enumerableExtensions";
import {LogLevel} from "../infrastructure/logger";
import {format} from "../infrastructure/formatting";
import {NodesLogger} from "./nodesLogger";

export class LogEntry {
  public node: IRootNode | null;
  public reference: SourceReference;
  public sortIndex: number;
  public isError: boolean;
  public message: string;

  constructor(reference: SourceReference, node: IRootNode | null, isError: boolean, message: string) {
    this.reference = reference;
    this.node = node;
    this.isError = isError;
    this.message = message;
    this.sortIndex = reference.sortIndex;
  }

  public toString(): string {
    return this.message;
  }
}

export interface IParserLogger {

  get entries(): LogEntry[];

  logInfo(message: string): void;
  log(reference: SourceReference, message: string): void;

  fail(reference: SourceReference, message: string): void;

  logNodes(nodes: Array<INode>): void;

  hasErrors(): boolean;
  hasRootErrors(): boolean;
  hasErrorMessage(expectedError: string): boolean;

  formatMessages(): string;
  nodeHasErrors(node: IRootNode): boolean;
  errorMessages(): string[];
  errorRootMessages(): string[];
  errorNodeMessages(node: IRootNode): string[];
  errorNodesMessages(node: Array<IRootNode>): string[];

  assertNoErrors(): void;

  setCurrentNode(node: IRootNode): void;
  resetCurrentNode(): void;
}

export class ParserLogger implements IParserLogger {

  private readonly logEntries: Array<LogEntry> = [];
  private readonly logger: ILogger;

  private currentNode: IRootNode | null = null;
  private failedMessages: number = 0;

  public get entries(): LogEntry[] {
    return this.logEntries.sort((left, right) => left.sortIndex - right.sortIndex);
  }

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  public hasErrors(): boolean {
    return this.failedMessages > 0;
  }

  public hasRootErrors(): boolean {
    return any(this.logEntries, entry => entry.isError && entry.node == null);
  }

  public logInfo(message: string): void {
    this.logger.logInformation(message);
  }

  public log(reference: SourceReference, message: string): void {
    this.logger.logDebug(`${reference}: ${message}`);
    this.logEntries.push(new LogEntry(reference, this.currentNode, false, `${reference}: ${message}`));
  }

  public fail(reference: SourceReference, message: string): void {

    this.failedMessages++;

    this.logger.logError(`${reference}: ERROR - ${message}`);
    this.logEntries.push(new LogEntry(reference, this.currentNode, true, `${reference}: ERROR - ${message}`));
  }

  public logNodes(nodes: Array<INode>): void {
    if (!this.logger.isEnabled(LogLevel.Debug)) return;

    let nodeLogger = new NodesLogger();
    nodeLogger.log(nodes);

    this.logger.logDebug(`Parsed nodes:\n${nodeLogger.toString()}`);
  }

  public hasErrorMessage(expectedError: string): boolean {
    return any(this.logEntries, message => message.isError && message.message.includes(expectedError));
  }

  public formatMessages(): string {
    return `${format(this.logEntries, 0)}\n`;
  }

  public setCurrentNode(node: IRootNode): void {
    this.currentNode = node;
  }

  public resetCurrentNode(): void {
    this.currentNode = null;
  }

  public nodeHasErrors(node: IRootNode): boolean {
    return any(this.logEntries, message => message.isError && message.node === node);
  }

  public errorNodeMessages(node: IRootNode): string[] {
    return where(this.logEntries, entry => entry.isError && entry.node === node)
      .sort((left, right) => left.sortIndex - right.sortIndex)
      .map(entry => entry.message);
  }

  public errorNodesMessages(nodes: Array<IRootNode>): string[] {
    return where(this.logEntries, entry => entry.isError && entry.node != null && nodes.indexOf(entry.node) >= 0)
      .sort((left, right) => left.sortIndex - right.sortIndex)
      .map(entry => entry.message);
  }

  public errorRootMessages(): string[] {
    return where(this.logEntries, entry => entry.isError && entry.node === null)
      .sort((left, right) => left.sortIndex - right.sortIndex)
      .map(entry => entry.message);
  }

  public errorMessages(): string[] {
    return where(this.logEntries, entry => entry.isError)
      .sort((left, right) => left.sortIndex - right.sortIndex)
      .map(entry => entry.message);
  }

  public assertNoErrors(): void {
    if (this.hasErrors()) {
      throw new Error(`Parsing failed: ${this.formatMessages()}`);
    }
  }
}
