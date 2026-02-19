import {Line} from "../line";
import {ISourceCodeDocument} from "./ISourceCodeDocument";
import {IFile} from "../../infrastructure/file";

export class StringSourceCodeDocument implements ISourceCodeDocument {

  private readonly code: string[];
  private currentLineValue: Line | null = null;

  private index: number;

  public readonly file: IFile;

  public get currentLine(): Line {
    if (this.currentLineValue == null) throw new Error("Current line not set.")
    return this.currentLineValue;
  }

  constructor(code: string[], file: IFile) {
    this.index = 0;
    this.file = file;
    this.code = code;
  }

  public hasMoreLines(): boolean {
    return this.index <= this.code.length - 1;
  }

  public nextLine(): Line {
    if (this.index >= this.code.length) throw new Error("No more lines");

    this.currentLineValue = this.createLine(this.index++);
    return this.currentLineValue;
  }

  public dispose() {
  }

  public toString(): string {
    const sourceCode = [];
    for (let lineIndex = 0; lineIndex < this.code.length; lineIndex++){
      const lineValue = this.createLine(lineIndex);
      sourceCode.push(lineValue.toString() + '\n');
    }
    return "Code: " + sourceCode.join("");
  }

  private createLine(lineIndex: number): Line {
    let lineContents = this.code[lineIndex];
    return new Line(lineIndex, lineContents, this.file);
  }
}
