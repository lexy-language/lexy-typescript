import {LineByLine} from "./lineByLine";
import {Line} from "../line";
import {Assert} from "../../infrastructure/assert";
import {ISourceCodeDocument} from "./ISourceCodeDocument";

export class FileSourceDocument implements ISourceCodeDocument {

  private readonly fileName: string;
  private lineByLine: LineByLine | null = null;

  private index: number = 0;

  public get fullFileName(): string {
    return this.fileName;
  }

  constructor(fileName: string) {
    this.fileName = fileName;
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
    return new Line(this.index++, line.toString(), this.fileName);
  }

  public dispose(): void {
    this.lineByLine?.dispose();
  }

  private ensureOpen(): LineByLine {
    if (this.lineByLine == null) {
      this.lineByLine = new LineByLine(this.fileName);
    }
    return this.lineByLine;
  }
}
