import {ExpressionFactory} from "./language/expressions/expressionFactory";
import {Tokenizer} from "./parser/tokens/tokenizer";
import {LexyParser} from "./parser/lexyParser";
import {LexyCompiler} from "./compiler/lexyCompiler";
import {ILogger} from "./infrastructure/logger";
import {IFileSystem} from "./infrastructure/IFileSystem";

export function createParser(baseLogger: ILogger, fileSystem: IFileSystem): LexyParser {
  const expressionFactory = new ExpressionFactory();
  const tokenizer = new Tokenizer();
  return new LexyParser(baseLogger, tokenizer,  fileSystem, expressionFactory);
}

export function createCompiler(compilerLogger: ILogger, executionLogger: ILogger): LexyCompiler {
  return new LexyCompiler(compilerLogger, executionLogger);
}