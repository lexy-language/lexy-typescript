import {LogVariables, VariablesLogger} from "./executionContext";
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