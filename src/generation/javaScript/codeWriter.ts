import {isNullOrEmpty} from "../../infrastructure/validationFunctions";
import {LexyCodeConstants} from "./lexyCodeConstants";
import {Expression} from "../../language/expressions/expression";

export class CodeWriter {
  private readonly builder: Array<string> = [];
  private readonly renderExpressionHandler: ((expression: Expression, codeWriter: CodeWriter) => void);
  private indent = 0;
  private currentLineValue = 0;

  public get currentLine() {
    return this.currentLineValue;
  }

  constructor(renderExpression: ((expression: Expression, codeWriter: CodeWriter) => void)) {
    this.renderExpressionHandler = renderExpression;
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

  writeLine(value: string | null = null) {
    if (value == null) {
      this.builder.push("\n");
    } else {
      this.builder.push(this.indentString() + value + "\n");
    }
    this.currentLineValue++;
  }

  write(value: string) {
    this.builder.push(value);
  }

  writeEnvironment(value: string | null = null) {
    if (value != null) {
      this.builder.push(LexyCodeConstants.environmentVariable + value);
    } else {
      this.builder.push(LexyCodeConstants.environmentVariable);
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

  public identifierFromEnvironment(value: string) {
    if (isNullOrEmpty(value)) throw new Error("Value is null or empty")
    return `${LexyCodeConstants.environmentVariable}.${value}`;
  }

  public renderExpression(expression: Expression) {
    this.renderExpressionHandler(expression, this);
  }
}