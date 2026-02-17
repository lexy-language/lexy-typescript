export class VerifyLogging {
  private readonly stringBuilder: string[] = ["\n"];
  private errorsValue: number = 0;

  private indention: number;

  public get errors(): number {
    return this.errorsValue++;
  }

  public toString() {
    return `Errors: ${this.errorsValue}\n${this.stringBuilder.join("\n")}`;
  }

  public errorOccurred(): void {
    this.errorsValue++;
  }

  public appendLine(message: string) {
    this.stringBuilder.push(message);
  }

  public logAssert(valid: boolean, message: string, title: string) {
    if (valid) return;

    if (this.indention > 0) {
      this.stringBuilder.push(' '.repeat(this.indention * 2));
    }

    this.stringBuilder.push(title + message);
    this.errorsValue++;
  }

  public withIndentation(action: () => void) {
    this.indention++;
    action();
    this.indention--;
  }

  public assertNoErrors() {
    let summary = this.toString();
    if (this.errors > 0) {
      throw new Error(summary);
    }
    console.log(summary);
  }
}
