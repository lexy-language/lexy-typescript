import type {ILogger} from "../infrastructure/logger";
import {Stack} from "../infrastructure/stack";

export class ExecutionLogEntry {

  private entriesValue: Array<ExecutionLogEntry> = [];
  private writeVariablesValue: LogVariables | null = null;
  private logVariables: LogVariablesHandler;

  public readonly fileName: string | null;
  public readonly lineNumber: number | null;
  public readonly message: string;
  public readonly readVariables: LogVariables;

  public get writeVariables(): LogVariables | null {
    return this.writeVariablesValue;
  }

  public get entries(): ReadonlyArray<ExecutionLogEntry> {
    return this.entriesValue;
  }

  constructor(logVariables: LogVariablesHandler, fileName: string | null, lineNumber: number | null, message: string, variables: LogVariables) {
    this.fileName = fileName;
    this.lineNumber = lineNumber;
    this.message = message;
    this.logVariables = logVariables;
    this.readVariables = this.deepCopy(variables);
  }

  public addEntry(entry: ExecutionLogEntry) {
    this.entriesValue.push(entry);
  }

  addVariables(variables: LogVariables) {
    this.writeVariablesValue = this.deepCopy(variables);
    this.logVariables(variables);
  }

  public deepCopy<T>(obj: T): T {
    if (obj instanceof Date) return new Date(obj) as T;
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map(item => this.deepCopy(item)) as unknown as T;
    const copy = {} as { [K in keyof T]: T[K] };
    Object.keys(obj).forEach(key => {
      if (key.startsWith("__")) return;
      copy[key as keyof T] = this.deepCopy((obj as { [key: string]: any })[key]);
    });
    return copy;
  }
}

export type LogVariable = Date | string | number | boolean | LogVariables;
export type LogVariables = { [key: string]: LogVariable };
export type LogVariablesHandler = (variables: LogVariables) => void;

export interface IExecutionContext {
  setFileName(fileName: string): void;

  log(message: string, lineNumber: number, variables: LogVariables): ExecutionLogEntry;
  logChild(message: string): void;
  openScope(message: string, lineNumber: number): void;
  closeScope(): void;

  useLastNodeAsScope(): void;
  revertToParentScope(): void;
}

type CurrentEntries = {
  scope: ExecutionLogEntry | undefined,
  last: ExecutionLogEntry | undefined
};

export class ExecutionContext implements IExecutionContext {

  private readonly logger: ILogger;

  private fileName: string | null = null;
  private entriesValue: Array<ExecutionLogEntry> = [];
  private entriesStack: Stack<CurrentEntries> = new Stack<CurrentEntries>();
  private currentEntryScope: ExecutionLogEntry | undefined;
  private lastEntry: ExecutionLogEntry | undefined;

  public get entries(): ReadonlyArray<ExecutionLogEntry> {
    return this.entriesValue;
  }

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  public setFileName(fileName: string): void {
    this.fileName = fileName;
  }

  public log(message: string, lineNumber: number, variables: LogVariables): ExecutionLogEntry {
    const entry = new ExecutionLogEntry(variables => this.logVariables(variables), this.fileName, lineNumber, message, variables);
    if (this.currentEntryScope == undefined) {
      this.entriesValue.push(entry);
    } else {
      this.currentEntryScope.addEntry(entry);
    }
    this.lastEntry = entry;

    const indent = " ".repeat(this.entriesStack.size() * 2);
    this.logger.logDebug(`${indent}${lineNumber}:' ${message}'`);
    if (!!variables) {
      this.logVariablesValues(variables, indent);
    }

    return entry;
  }

  private logVariablesValues(variables: LogVariables, indent: string) {
    const keys = Object.keys(variables);
    for (const key of keys) {
      this.logger.logDebug(`${indent}  - ${key}: ${JSON.stringify(variables[key])}`);
    }
  }

  public logChild(message: string) {
    if (this.lastEntry == undefined) {
      throw new Error("lastEntry not set");
    }

    this.lastEntry.addEntry(new ExecutionLogEntry(variables => this.logVariables(variables), this.fileName, null,  message, {}));
    const indent = " ".repeat(this.entriesStack.size() * 2);
    this.logger.logDebug(`${indent}  '${message}'`);
  }

  public logVariables(variables: LogVariables) {
    const indent = " ".repeat(this.entriesStack.size() * 2);
    this.logVariablesValues(variables, indent);
  }

  public openScope(message: string, lineNumber: number) {
    this.entriesStack.push({
      scope: this.currentEntryScope,
      last: this.lastEntry
    });
    this.log(message, lineNumber,{});
    this.currentEntryScope = this.lastEntry;
  }

  public closeScope() {
    const entry = this.entriesStack.pop();
    this.currentEntryScope = entry?.scope;
    this.lastEntry = entry?.last;
  }

  public useLastNodeAsScope() {
    this.entriesStack.push({
      scope: this.currentEntryScope,
      last: this.lastEntry
    });
    this.currentEntryScope = this.lastEntry;
  }

  public revertToParentScope() {
    const entry = this.entriesStack.pop();
    this.currentEntryScope = entry?.scope;
    this.lastEntry = entry?.last;
  }
}
