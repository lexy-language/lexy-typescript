import {Position} from "./position";
import {SourceReference} from "./sourceReference";

export interface ReadonlySourceArea {
  includes(position: Position): boolean;
}

export class SourceArea implements ReadonlySourceArea {

  private readonly begin: Position;
  private end: Position;

  constructor(reference: SourceReference) {
    this.begin = new Position(reference.lineNumber, reference.column);
    this.end = new Position(reference.lineNumber, reference.endColumn);
  }

  public expand(position: Position): void {
    this.end = position;
  }

  public includes(position: Position): boolean {
    if (position.lineNumber < this.begin.lineNumber) return false;
    if (position.lineNumber > this.end.lineNumber) return false;

    if (position.lineNumber == this.begin.lineNumber) {
      if (position.lineNumber == this.end.lineNumber) {
        return position.column >= this.begin.column && position.column <= this.end.column;
      }
      return position.column >= this.begin.column;
    }

    if (position.lineNumber == this.end.lineNumber) {
      return position.column <= this.end.column + 1;
    }

    return true;
  }

  public toString(): string {
    return `Begin (${this.begin}) End (${this.end})`;
  }
}
