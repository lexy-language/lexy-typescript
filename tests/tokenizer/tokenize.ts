import {Tokenizer} from "../../src/parser/tokens/tokenizer";
import {Line} from "../../src/parser/line";
import {TokenValidator} from "../../src/parser/tokenValidator";
import {TokenizeFailed} from "../../src/parser/tokens/tokenizeResult";
import {ParserLogger} from "../../src/parser/logging/parserLogger";
import {LoggingConfiguration} from "../loggingConfiguration";
import {Assert} from "../../src";
import {TestFile} from "../testFile";

export function tokenize(value: string): TokenValidator {

  Assert.notNull(value, "value");

  const tokenizer = new Tokenizer();
  const line = new Line(0, value, TestFile.instance);
  const tokens = line.tokenize(tokenizer);
  if (tokens.state == 'failed') {
    throw new Error(`Process line failed: ` + tokens.errorMessage);
  }

  const logger = new ParserLogger(LoggingConfiguration.getParserLogger());

  return new TokenValidator("tests", line, logger);
}

export function tokenizeExpectError(value: string): TokenizeFailed {

  const tokenizer = new Tokenizer();
  const line = new Line(0, value, TestFile.instance);
  const tokenizeResult = line.tokenize(tokenizer);
  if (tokenizeResult.state != 'failed') {
    throw new Error("Tokenizing didn't fail, but should have.");
  }
  return tokenizeResult;
}
