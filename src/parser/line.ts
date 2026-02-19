import type {ITokenizer} from "./tokens/tokenizer";
import type {IParserLogger} from "./logging/parserLogger";
import type {IFile} from "../infrastructure/file";

import {SourceReference} from "../language/sourceReference";
import {TokenizeResult} from "./tokens/tokenizeResult";
import {TokenList} from "./tokens/tokenList";
import {TokenCharacter} from "./tokens/tokenCharacter";
import {Position} from "../language/position";
import {Assert} from "../infrastructure/assert";

export class Line {

  private tokensValues: TokenList | null = null;

  public readonly index: number;
  public readonly content: string;
  public readonly file: IFile;

  public get tokens(): TokenList {
    if (!this.tokensValues) {
      throw new Error("Tokens not set");
    }
    return this.tokensValues;
  }

  public endPosition: Position;

  constructor(index: number, line: string, file: IFile) {
    this.index = index;
    this.content = Assert.notNull(line, "line");
    this.file = Assert.notNull(file, "file");
    this.endPosition = new Position(index + 1, line.length);
  }

  public indent(logger: IParserLogger): number | null {
    let spaces: number = 0;
    let tabs = 0;

    let index = 0;

    while (index < this.content.length) {
      let value = this.content[index];
      if (value == ' ') {
        spaces++;
      } else if (value == '\t') {
        tabs++;
      } else {
        break;
      }
      index++;
    }

    if (spaces > 0 && tabs > 0) {
      logger.fail(this.lineReference(index),
        `Don't mix spaces and tabs for indentations. Use 2 spaces or tabs.`);
      return null;
    }

    if (spaces % 2 != 0) {
      logger.fail(this.lineReference(index),
        `Wrong number of indent spaces ${spaces}. Should be multiplication of 2.`);
      return null;
    }

    return tabs > 0 ? tabs : spaces / 2;
  }

  public toString(): string {
    return `${this.index + 1}: ${this.content}`;
  }

  public isEmpty(): boolean {
    return this.tokens != null && this.tokens.length == 0;
  }

  public lineReference(characterIndex: number): SourceReference {
    return new SourceReference(
      this.file,
      this.index + 1,
      characterIndex + 1,
      characterIndex + 1);
  }

  public lineEndReference(): SourceReference {

    if (this.tokensValues == null || this.tokensValues.length == 0) {
      return new SourceReference(this.file, this.index + 1, 1, this.content.length + 1);
    }

    const columnEnd = this.tokens.lastColumn();
    return new SourceReference(
      this.file,
      this.index + 1,
      columnEnd - 1,
      columnEnd);
  }

  public tokenize(tokenizer: ITokenizer): TokenizeResult {
    let tokenizeResult = tokenizer.tokenize(this);
    if (tokenizeResult.state == 'success') {
      this.tokensValues = tokenizeResult.result;
    }
    return tokenizeResult;
  }

  public character(index: number): TokenCharacter {
    let value = this.content.charCodeAt(index);
    return new TokenCharacter(value, index);
  }
}
