import type {ILogger} from "./infrastructure/logger";
import type {IFileSystem} from "./infrastructure/IFileSystem";

import {Tokenizer} from "./parser/tokens/tokenizer";
import {LexyParser} from "./parser/lexyParser";
import {LexyCompiler} from "./generation/lexyCompiler";
import {ILibraries} from "./functionLibraries/libraries";

export function createParser(baseLogger: ILogger, fileSystem: IFileSystem, libraries: ILibraries): LexyParser {
  const tokenizer = new Tokenizer();
  return new LexyParser(baseLogger, tokenizer, fileSystem, libraries);
}

export function createCompiler(compilerLogger: ILogger, executionLogger: ILogger, libraries: ILibraries): LexyCompiler {
  return new LexyCompiler(compilerLogger, executionLogger, libraries);
}
