import type {ISourceCodeDocument} from "./ISourceCodeDocument";

import {LineByLine} from "./lineByLine";
import {Line} from "../line";
import {Assert} from "../../infrastructure/assert";
import {IFileSystem} from "../../infrastructure/IFileSystem";
import {IFile} from "../../infrastructure/file";

export class FileSourceDocument implements ISourceCodeDocument {

  private lineByLine: LineByLine | null = null;

  private index: number = 0;

  public readonly file: IFile;

  constructor(file: IFile) {
    this.file = Assert.notNull(file, "file");
  }

public hasMoreLines(): boolean {
    const lineByLine = this.ensureOpen();
    return !lineByLine.isLast();
  }

  public nextLine(): Line {
    const lineByLine = Assert.notNull(this.lineByLine, "streamReader");
    Assert.false(lineByLine.isLast(), "No more lines.");

    const line = lineByLine?.next();
    if (line == null) {
      throw new Error("No more lines.");
    }
    return new Line(this.index++, line.toString(), this.file);
  }

  public dispose(): void {
    this.lineByLine?.dispose();
  }

  private ensureOpen(): LineByLine {
    if (this.lineByLine == null) {
      this.lineByLine = new LineByLine(this.file.fullPath);
    }
    return this.lineByLine;
  }
}
