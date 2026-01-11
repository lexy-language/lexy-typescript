import type {IParseLineContext} from "../parser/ParseLineContext";
import type {IParserContext} from "../parser/parserContext";

import {SourceReference} from "../parser/sourceReference";
import {Line} from "../parser/line";
import {Keywords} from "../parser/Keywords";
import {isNullOrEmpty} from "../infrastructure/validationFunctions";
import {LexySourceDocument} from "../parser/lexySourceDocument";

export class Include {
  private isProcessedValue: boolean = false;
  private readonly reference: SourceReference;

  public readonly fileName: string

  public get isProcessed(): boolean {
    return this.isProcessedValue;
  }

  constructor(fileName: string, reference: SourceReference) {
    this.reference = reference;
    this.fileName = fileName;
  }

  public static isValid(line: Line): boolean {
    return line.tokens.isKeyword(0, Keywords.Include);
  }

  public static parse(context: IParseLineContext): Include | null {
    let line = context.line;
    let lineTokens = line.tokens;
    if (lineTokens.length != 2 || !lineTokens.isQuotedString(1)) {
      context.logger.fail(line.lineStartReference(),
        "Invalid syntax. Expected: 'include \`FileName\`");
      return null;
    }

    let value = lineTokens.tokenValue(1);
    if (value == null) return null;

    return new Include(value, line.lineStartReference());
  }

  public async process(parentFullFileName: string, context: IParserContext): Promise<string | null> {
    this.isProcessedValue = true;
    if (isNullOrEmpty(this.fileName)) {
      context.logger.fail(this.reference, `No include file name specified.`);
      return null;
    }

    let directName = context.fileSystem.getDirectoryName(parentFullFileName);
    let fullPath = context.fileSystem.getFullPath(directName);
    let fullFileName = `${context.fileSystem.combine(fullPath, this.fileName)}.${LexySourceDocument.fileExtension}`;

    if (! await context.fileSystem.fileExists(fullFileName)) {
      context.logger.fail(this.reference, `Invalid include file name '${this.fileName}'`);
      return null;
    }

    return fullFileName;
  }
}
