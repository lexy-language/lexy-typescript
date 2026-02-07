import {Line} from "../line";
import {ISourceCodeDocument} from "./ISourceCodeDocument";

export class StringSourceCodeDocument implements ISourceCodeDocument {

  private readonly code: string[];
  private readonly fileName: string;
  private currentLineValue: Line | null = null;

  private index: number;

  public get fullFileName(): string {
    return this.fileName;
  }

  public get currentLine(): Line {
    if (this.currentLineValue == null) throw new Error("Current line not set.")
    return this.currentLineValue;
  }

  constructor(code: string[], fileName: string) {
    this.index = 0;
    this.fileName = fileName;
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
    return new Line(lineIndex, lineContents, this.fileName);
  }
}
