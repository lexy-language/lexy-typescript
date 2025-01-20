import {SourceFile} from "./sourceFile";

export class SourceReference {
  public readonly characterNumber: number;
  public readonly lineNumber: number;

  public readonly file: SourceFile;

  public get sortIndex(): string {
    const value = (this.lineNumber * 100000000 + this.characterNumber).toString();
    return `${this.file.fileName}/${'0'.repeat(16 - value.toString().length)}${value}}`;
  }

  constructor(file: SourceFile, lineNumber: number, characterNumber: number) {
    this.file = file;
    this.lineNumber = lineNumber;
    this.characterNumber = characterNumber;
  }

  public toString(): string {
    return `${this.file.fileName}(${this.lineNumber}, ${this.characterNumber})`;
  }
}