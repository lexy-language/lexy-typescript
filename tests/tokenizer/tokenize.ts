import {Tokenizer} from "../../src/parser/tokens/tokenizer";
import {SourceFile} from "../../src/parser/sourceFile";
import {Line} from "../../src/parser/line";
import {TokenValidator} from "../../src/parser/tokenValidator";
import {ParseLineContext} from "../../src/parser/ParseLineContext";
import {TokenizeFailed} from "../../src/parser/tokens/tokenizeResult";
import {ExpressionFactory} from "../../src/language/expressions/expressionFactory";
import {ParserLogger} from "../../src/parser/parserLogger";
import {LoggingConfiguration} from "../loggingConfiguration";
import {Assert} from "../../src";

export function tokenize(value: string): TokenValidator {

  Assert.notNull(value, "value");

  const tokenizer = new Tokenizer();
  const file = new SourceFile("tests.lexy");
  const line = new Line(0, value, file);
  const tokens = line.tokenize(tokenizer);
  if (tokens.state != 'success') {
    throw new Error(`Process line failed: ` + tokens.errorMessage);
  }

  const logger = new ParserLogger(LoggingConfiguration.getParserLogger());
  const expressionFactory = new ExpressionFactory();

  const parseLineContext = new ParseLineContext(line, logger, expressionFactory);

  return parseLineContext.validateTokens("tests");
}

export function tokenizeExpectError(value: string): TokenizeFailed {

  const tokenizer = new Tokenizer();
  const file = new SourceFile("tests.lexy");
  const line = new Line(0, value, file);
  const tokenizeResult = line.tokenize(tokenizer);
  if (tokenizeResult.state != 'failed') {
    throw new Error("Tokenizing didn't fail, but should have.");
  }
  return tokenizeResult;
}
