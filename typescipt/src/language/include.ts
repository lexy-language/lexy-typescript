import {SourceReference} from "../parser/sourceReference";
import {Line} from "../parser/line";
import {Keywords} from "../parser/Keywords";
import {IParseLineContext} from "../parser/ParseLineContext";
import {IParserContext} from "../parser/parserContext";
import {isNullOrEmpty} from "../parser/tokens/character";


export class Include {
   private isProcessedValue: boolean;
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
         "Invalid syntax. Expected: 'Include \`FileName\`");
       return null;
     }

     let value = lineTokens.tokenValue(1);
     if (value == null) return null;

     return new Include(value, line.lineStartReference());
   }

   public process(parentFullFileName: string, context: IParserContext): string | null {
     this.isProcessedValue = true;
     if (isNullOrEmpty(this.fileName)) {
       context.logger.fail(this.reference, `No include file name specified.`);
       return null;
     }

     let directName = context.fileSystem.getDirectoryName(parentFullFileName);
     let fullPath = context.fileSystem.getFullPath(directName);
     let fullFinName = `${context.fileSystem.combine(fullPath, this.fileName)}.{LexySourceDocument.FileExtension}`;

     if (!context.fileSystem.fileExists(fullFinName)) {
       context.logger.fail(this.reference, `Invalid include file name '${this.fileName}'`);
       return null;
     }

     return fullFinName;
   }
}