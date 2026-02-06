export class Position {

  public readonly lineNumber: number;
  public readonly column: number;

  constructor(lineNumber: number, column: number) {
    this.lineNumber = lineNumber;
    this.column = column;
  }

  public toString(): string {
    return this.lineNumber + ":" + this.column;
  }

  public addEndColumn(amount: number): Position{
    return new Position(this.lineNumber, this.column + amount);
  }
}

