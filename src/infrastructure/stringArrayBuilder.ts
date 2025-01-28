export default class StringArrayBuilder {
  private values = new Array<string>();

  constructor(value: string) {
    this.add(value);
  }

  public add(value: string, indent: number = 0): StringArrayBuilder {
    const indentString = StringArrayBuilder.indentString(indent);
    this.values.push(indentString + value);
    return this;
  }

  private static indentString(indent: number): string {
    return indent > 0 ? ' '.repeat(indent) : '';
  }

  public list(strings:ReadonlyArray<string> | undefined): StringArrayBuilder {
    if (strings == undefined) return this;
    const indentString = StringArrayBuilder.indentString(2);
    for (let value of strings) {
      this.values.push(indentString + value);
    }
    return this;
  }

  public array(): Array<string> {
    return this.values;
  }

  public static new(value: string): StringArrayBuilder {
    return new StringArrayBuilder(value);
  }
}