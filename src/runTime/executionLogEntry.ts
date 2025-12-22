import type {LogVariables, VariablesLogger} from "./executionContext";

import {NodeType} from "../language/nodeType";
import {deepCopy} from "../infrastructure/deepCopy";

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
    this.readVariables = deepCopy(variables);
  }

  public addEntry(entry: ExecutionLogEntry) {
    this.entriesValue.push(entry);
  }

  addVariables(variables: LogVariables) {
    this.writeVariablesValue = deepCopy(variables);
    this.logVariables(variables);
  }
}