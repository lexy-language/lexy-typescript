import {Tokenizer} from "../../src/parser/tokens/tokenizer";
import {formatLine} from "../../src/formatting/formatLine";
import {SourceReference} from "../../src/parser/tokens/sourceReference";
import {SourceFile} from "../../src/parser/tokens/sourceFile";
import {IParserLogger} from "../../src/parser/tokens/IParserLogger";
import {Line} from "../../src/parser/tokens/line";
import {TokenValidator} from "../../src/parser/TokenValidator";
import {ParseLineContext} from "../../src/parser/ParseLineContext";
import {TokenizeFailed} from "../../src/parser/tokens/tokenizeResult";

class DummyParserLogger implements IParserLogger {

  private errors: Array<string> = [];

  fail(reference: SourceReference, message: string) {
    this.errors.push(message);
    console.log(`${reference} - ERROR - ${message}`)
  }

  formatMessages(): string {
    return formatLine(this.errors, '\n');
  }

  hasErrorMessage(expectedError: string): boolean {
    return this.errors.findIndex(value => value.includes(expectedError)) >= 0;
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  log(reference: SourceReference, message: string) {
    console.log(`${reference} - ${message}`)
  }

  logInfo(message: string) {
    console.log(`INFO - ${message}`)
  }
}

export function tokenize(value: string): TokenValidator {

  let tokenizer = new Tokenizer();
  let file = new SourceFile("tests.lexy");
  let line = new Line(0, value, file);
  let tokens = line.tokenize(tokenizer);
  if (tokens.state != 'success') {
    throw new Error(`Process line failed: ` + tokens.errorMessage);
  }

  let logger = new DummyParserLogger();

  let parseLineContext = new ParseLineContext(line, logger);

  return parseLineContext.validateTokens("tests");
}

export function tokenizeExpectError(value: string): TokenizeFailed {

  let tokenizer = new Tokenizer();
  let file = new SourceFile("tests.lexy");
  let line = new Line(0, value, file);
  let tokens = line.tokenize(tokenizer);
  if (tokens.state != 'failed') {
    throw new Error(`Process didn't fail.`);
  }

  let logger = new DummyParserLogger();

  new ParseLineContext(line, logger);

  return tokens;
}
