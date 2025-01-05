import type {IExpressionFactory} from "../language/expressions/expressionFactory";
import type {IParserLogger} from "./ParserLogger";

import {Line} from "./line";
import {TokenValidator} from "./tokenValidator";
import {SourceReference} from "./sourceReference";

export interface IParseLineContext {
  line: Line;
  logger: IParserLogger;
  expressionFactory: IExpressionFactory;

  validateTokens(name: string): TokenValidator;

  failed<T>(result: {state: string, errorMessage?: string}, reference: SourceReference) : boolean;
}

export class ParseLineContext implements IParseLineContext {

  public readonly line: Line;
  public readonly logger: IParserLogger;
  public readonly expressionFactory: IExpressionFactory;

  constructor(line: Line, logger: IParserLogger, expressionFactory: IExpressionFactory) {
    this.line = line;
    this.logger = logger;
    this.expressionFactory = expressionFactory;
  }

  public validateTokens(name: string): TokenValidator {
    return new TokenValidator(name, this.line, this.logger);
  }

  failed<T>(result: {state: string, errorMessage: string}, reference: SourceReference) : boolean
  {
    if (result.state == "Success") return false;

    this.logger.fail(reference, result.errorMessage);

    return true;
  }
}