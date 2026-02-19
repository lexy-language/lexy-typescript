import {SourceFile} from "../../parser/sourceFile";
import {Line} from "../../parser/line";
import {TokenList} from "../../parser/tokens/tokenList";
import {SourceReference} from "../sourceReference";
import {Assert} from "../../infrastructure/assert";
import {IFile} from "../../infrastructure/file";

export class ExpressionSource {
   public file: IFile;
   public line: Line;
   public tokens: TokenList;

   constructor(line: Line, tokens: TokenList) {
     if (tokens.length == 0) throw new Error("No tokens.")
     this.line = Assert.notNull(line, "line");
     this.file = Assert.notNull(line.file, "fileName");
     this.tokens = Assert.notNull(tokens, "tokens");
   }

   public createReference(): SourceReference {
     let token = this.tokens.get(0);
     if (!token) throw new Error(`No token at: ${0}` + JSON.stringify(this.tokens))
     let tokenEnd = this.tokens.get(this.tokens.length - 1);
     if (!tokenEnd) throw new Error(`No token at: ${this.tokens.length - 1}` + JSON.stringify(this.tokens))

     return new SourceReference(
       this.file,
       this.line.index + 1,
       token.firstCharacter.position + 1,
       tokenEnd.endColumn + 1);
   }
}
