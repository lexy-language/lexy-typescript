import type {IParserLogger} from "../logging/parserLogger";
import type {IDocumentSymbols} from "../symbols/documentSymbols";

import {Line} from "../line";
import {TokenValidator} from "../tokenValidator";
import {SourceReference} from "../../language/sourceReference";
import {Assert} from "../../infrastructure/assert";

export interface IParseLineContext {
  line: Line;
  logger: IParserLogger;

  symbols: IDocumentSymbols;

  validateTokens(name: string): TokenValidator;

  failed<T>(result: {state: string, errorMessage?: string}, reference: SourceReference) : boolean;
}

export class ParseLineContext implements IParseLineContext {

  public readonly line: Line;
  public readonly logger: IParserLogger;
  public readonly symbols: IDocumentSymbols;

  constructor(line: Line, logger: IParserLogger, symbols: IDocumentSymbols) {
    this.line = Assert.notNull(line, "line");
    this.logger = Assert.notNull(logger, "logger");
    this.symbols = Assert.notNull(symbols, "symbols");
  }

  public validateTokens(name: string): TokenValidator {
    return new TokenValidator(name, this.line, this.logger);
  }

  failed<T>(result: {state: string, errorMessage: string}, reference: SourceReference) : boolean {
    if (result.state == "Success") return false;

    this.logger.fail(reference, result.errorMessage);

    return true;
  }
}
