import {IRootNode} from "../language/rootNode";
import {SourceReference} from "../parser/sourceReference";
import {ExecutionLogEntry} from "../runTime/executionLogEntry";

export class SpecificationsLogEntry {
  public readonly node: IRootNode | null;
  public readonly reference: SourceReference | null;
  public readonly isError: boolean;
  public readonly message: string;
  public readonly errors: Array<string> | null;
  public readonly executionLogging: ReadonlyArray<ExecutionLogEntry> | null;

  constructor(reference: SourceReference | null, node: IRootNode | null, isError: boolean, message: string,
              errors: Array<string> | null = null, executionLogging: ReadonlyArray<ExecutionLogEntry> | null = null) {
    this.reference = reference;
    this.node = node;
    this.isError = isError;
    this.message = message;
    this.errors = errors;
    this.executionLogging = executionLogging;
  }

  public toString(): string {
    return this.errors == null
      ? this.message
      : this.message + '\n' + this.errors?.join("\n");
  }
}