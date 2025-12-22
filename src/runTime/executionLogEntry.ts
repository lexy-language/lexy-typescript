import type {LogVariables, VariablesLogger} from "./executionContext";

import {NodeType} from "../language/nodeType";
import Decimal from "decimal.js";

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
    this.readVariables = ExecutionLogEntry.deepCopy(variables);
  }

  public addEntry(entry: ExecutionLogEntry) {
    this.entriesValue.push(entry);
  }

  addVariables(variables: LogVariables) {
    this.writeVariablesValue = ExecutionLogEntry.deepCopy(variables);
    this.logVariables(variables);
  }

  private static deepCopy<T>(obj: T): T {
    if (obj === null) return null as T;
    if (obj instanceof Date) return this.copyDate(obj) as T;
    if (Decimal.isDecimal(obj)) return this.copyDecimal(obj as Decimal) as T;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return this.copyArray(obj) as unknown as T;
    return this.copyObject(obj);
  }

  private static copyDate(date: Date): Date {
    return new Date(date);
  }

  private static copyDecimal(decimal: Decimal): number {
    return decimal.toNumber();
  }

  private static copyArray<T>(obj: T & any[]) {
    return obj.map(item => ExecutionLogEntry.deepCopy(item));
  }

  private static copyObject<T extends  {}>(obj: T ): T {
    const copy = {} as { [K in keyof T]: T[K] };
    Object.keys(obj).forEach(key => {
      if (key.startsWith("__")) return;
      copy[key as keyof T] = ExecutionLogEntry.deepCopy((obj as { [key: string]: any })[key]);
    });
    return copy;
  }
}