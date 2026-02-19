import type {IFile} from "../infrastructure/file";

import {Position} from "./position";

export class SourceReference {

  public readonly lineNumber: number;
  public readonly column: number;
  public readonly endColumn: number;

  public readonly file: IFile;

  public get sortIndex(): string {
    const value = (this.lineNumber * 100000000 + this.column).toString();
    return `${this.file.name}/${'0'.repeat(16 - value.toString().length)}${value}}`;
  }

  constructor(file: IFile, lineNumber: number, column: number, endColumn: number) {
    this.file = file;
    this.lineNumber = lineNumber;
    this.column = column;
    this.endColumn = endColumn;
  }

  public toString(): string {
    const suffix = this.column != this.endColumn ? `-${this.endColumn}`: '';
    return `${this.file.name} (${this.lineNumber}:${this.column}${suffix})`;
  }

  public includes(position: Position): boolean {
    return position.lineNumber == this.lineNumber
        && position.column >= this.column
        && position.column <= this.endColumn;
  }

  public equals(other: SourceReference): boolean {
    return this.lineNumber == other.lineNumber
        && this.column == other.column
        && this.endColumn == other.endColumn
        && this.file.equals(other.file);
  }
}

