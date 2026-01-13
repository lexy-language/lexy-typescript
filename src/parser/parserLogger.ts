import type {IComponentNode} from "../language/componentNode";
import type {INode} from "../language/node";
import type {ILogger} from "../infrastructure/logger";

import {SourceReference} from "./sourceReference";
import {any, where} from "../infrastructure/arrayFunctions";
import {LogLevel} from "../infrastructure/logger";
import {format} from "../infrastructure/formatting";
import {NodesLogger} from "./nodesLogger";
import {instanceOfLexyScriptNode} from "../language/lexyScriptNode";

export class LogEntry {
  public node: IComponentNode | null;
  public reference: SourceReference;
  public sortIndex: string;
  public isError: boolean;
  public message: string;

  constructor(reference: SourceReference, node: IComponentNode | null, isError: boolean, message: string) {
    this.reference = reference;
    this.node = node;
    this.isError = isError;
    this.message = message;
    this.sortIndex = reference.sortIndex;
  }

  public toString(): string {
    return this.node != null
      ? `(${this.node?.nodeName}) ${this.message}`
      : this.message;
  }
}

export interface IParserLogger {

  get entries(): Array<LogEntry>;

  logInfo(message: string): void;
  log(reference: SourceReference, message: string): void;

  fail(reference: SourceReference, message: string): void;

  logNodes(nodes: readonly INode[]): void;

  hasErrors(): boolean;
  hasComponentErrors(): boolean;
  hasErrorMessage(expectedError: string): boolean;

  formatMessages(): string;
  nodeHasErrors(node: IComponentNode): boolean;
  errorMessages(): string[];
  errorComponentMessages(): string[];
  errorNodeMessages(node: IComponentNode): string[];
  errorNodesMessages(node: Array<IComponentNode>): string[];

  assertNoErrors(): void;

  setCurrentNode(node: IComponentNode): void;
  resetCurrentNode(): void;
}

export class ParserLogger implements IParserLogger {

  private readonly logEntries: Array<LogEntry> = [];
  private readonly logger: ILogger;

  private currentNode: IComponentNode | null = null;
  private failedMessages: number = 0;

  public get entries(): Array<LogEntry> {
    return this.logEntries;
  }

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  public hasErrors(): boolean {
    return this.failedMessages > 0;
  }

  public hasComponentErrors(): boolean {
    return any(this.logEntries, this.isComponentError);
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

  public setCurrentNode(node: IComponentNode): void {
    this.currentNode = node;
  }

  public resetCurrentNode(): void {
    this.currentNode = null;
  }

  public nodeHasErrors(node: IComponentNode): boolean {
    return any(this.logEntries, message => message.isError && message.node === node);
  }

  public errorNodeMessages(node: IComponentNode): string[] {
    return where(this.logEntries, entry => entry.isError && entry.node === node)
      .sort(this.sortEntry)
      .map(entry => entry.message);
  }

  public errorNodesMessages(nodes: Array<IComponentNode>): string[] {
    return where(this.logEntries, entry => entry.isError && entry.node != null && nodes.indexOf(entry.node) >= 0)
      .sort(this.sortEntry)
      .map(entry => entry.message);
  }

  public errorComponentMessages(): string[] {
    return where(this.logEntries, this.isComponentError)
      .sort(this.sortEntry)
      .map(entry => entry.message);
  }

  private isComponentError(entry: LogEntry) {
    return entry.isError && (entry.node == null || instanceOfLexyScriptNode(entry.node));
  }

  public errorMessages(): string[] {
    return where(this.logEntries, entry => entry.isError)
      .sort(this.sortEntry)
      .map(entry => entry.message);
  }

  private sortEntry(left: LogEntry, right: LogEntry) {
    return left.sortIndex < right.sortIndex ? -1 : 1;
  }

  public assertNoErrors(): void {
    if (this.hasErrors()) {
      throw new Error(`Parsing failed: ${this.formatMessages()}`);
    }
  }
}
