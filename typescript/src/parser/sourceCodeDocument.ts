import {SourceFile} from "./sourceFile";
import {Line} from "./line";

export interface ISourceCodeDocument {
  currentLine: Line;

  setCode(lines: string[], fileName: string): void;

  hasMoreLines(): boolean;
  nextLine(): Line;
  reset(): void;
}

export class SourceCodeDocument implements ISourceCodeDocument {

   private code: Line[] = [];
   private file: SourceFile = new SourceFile("null");

  private currentLineValue: Line | null = null;
  private index: number = -1;

   public get currentLine(): Line {
     if (this.currentLineValue == null) throw new Error(`No current line.`);
     return this.currentLineValue;
  }

  public setCode(lines: string[], fileName: string): void {
   this.index = -1;
   this.file = new SourceFile(fileName);
   this.code = lines.map((line, index) => new Line(index, line, this.file));
  }

   public hasMoreLines(): boolean {
     return this.index < this.code.length - 1;
   }

   public nextLine(): Line {
     if (this.index >= this.code.length) throw new Error(`No more lines`);

     this.currentLineValue = this.code[++this.index];
     return this.currentLineValue;
   }

   public reset(): void {
     this.currentLineValue = null;
   }
}
