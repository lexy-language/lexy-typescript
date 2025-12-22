import type {LogVariables, VariablesLogger} from "./executionContext";

import {NodeType} from "../language/nodeType";

export class ExecutionLogEntry {

  private entriesValue: Array<ExecutionLogEntry> = [];
  private writeVariablesValue: LogVariables | null = null;
  private logVariables: VariablesLogger;

  public readonly fileName: string | null;
  public readonly lineNumber: number | null;
  public readonly message: string;
  public readonly readVariables: LogVariables;
  public readonly nodeType = NodeType.ExecutionLogEntry;

  public get writeVariables(): LogVariables | null {
    return this.writeVariablesValue;
  }

  public get entries(): ReadonlyArray<ExecutionLogEntry> {
    return this.entriesValue;
  }

  constructor(logVariables: VariablesLogger, fileName: string | null, lineNumber: number | null, message: string, variables: LogVariables) {
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
    if (obj === null) return null as T;
    if (obj instanceof Date) return this.copyDate(obj);
    if (toString.call(obj) === '[object Decimal]') return this.copyNumber(obj);
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return this.copyArray(obj);
    return this.copyObject(obj);
  }

  private copyDate<T>(obj: T & Date) {
    return new Date(obj) as T;
  }

  private copyNumber<T>(obj: T) {
    return (obj as any).toNumber() as T;
  }

  private copyArray<T>(obj: T & any[]) {
    return obj.map(item => this.deepCopy(item)) as unknown as T;
  }

  private copyObject<T extends  {}>(obj: T ): T {
    const copy = {} as { [K in keyof T]: T[K] };
    Object.keys(obj).forEach(key => {
      if (key.startsWith("__")) return;
      copy[key as keyof T] = this.deepCopy((obj as { [key: string]: any })[key]);
    });
    return copy;
  }
}