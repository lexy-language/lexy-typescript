import {isNullOrEmpty} from "../../../parser/tokens/character";

export class CodeWriter {
  private readonly builder: Array<string> = [];
  private readonly namespace;
  private indent = 0;
  private currentLineValue = 0;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  public get currentLine() {
    return this.currentLineValue;
  }

  startLine(value: string | null = null) {
    if (value != null) {
      this.builder.push(this.indentString() + value);
    } else {
      this.builder.push(this.indentString());
    }
  }

  endLine(value: string | null = null) {
    if (value != null) {
      this.builder.push(value + "\n");
    } else {
      this.builder.push("\n");
    }
    this.currentLineValue++;
  }

  writeLine(value: string) {
    this.builder.push(this.indentString() + value + "\n");
    this.currentLineValue++;
  }

  write(value: string) {
    this.builder.push(value);
  }

  writeNamespace(value: string | null = null) {
    if (value != null) {
      this.builder.push(this.namespace + value);
    } else {
      this.builder.push(this.namespace);
    }
  }

  openScope(value: string | null = null) {
    if (value != null) {
      this.writeLine(value + " {")
    } else {
      this.writeLine(" {")
    }
    this.indent++
  }

  openInlineScope(value: string) {
    this.endLine(value + " {")
    this.indent++
  }

  closeScope(suffix: string | null = null) {
    this.indent--;
    if (suffix != null) {
      this.writeLine("}" + suffix)
    } else {
      this.writeLine("}")
    }
  }

  openBrackets(name: string) {
    this.writeLine(name + " [")
    this.indent++
  }

  closeBrackets(suffix: string | null = null) {
    this.indent--;
    if (suffix != null) {
      this.writeLine("]" + suffix)
    } else {
      this.writeLine("]")
    }
  }

  public toString(): string {
    return this.builder.join("")
  }

  private indentString() {
    return ' '.repeat(this.indent * 2);
  }

  identifierFromNamespace(value: string) {
    if (isNullOrEmpty(value)) throw new Error("Value is null or empty")
    if (value[0] == ".") {
      return this.namespace + value;
    } else {
      return `${this.namespace}.${value}`;
    }
  }
}