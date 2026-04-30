import {ValueType} from "../../../src/language/typeSystem/valueType";
import {Type} from "../../../src/language/typeSystem/type";
import {SourceReference} from "../../../src/language/sourceReference";
import {IValidationContext, ValidationContext} from "../../../src/parser/context/validationContext";
import {VariableSource} from "../../../src/language/variableSource";
import {parseExpression} from "../expressionParser/parseExpression";
import {ComponentNodeList} from "../../../src/language/componentNodeList";
import {ParserLogger} from "../../../src/parser/logging/parserLogger";
import {LoggingConfiguration} from "../../loggingConfiguration";
import {TrackLoggingCurrentNodeVisitor} from "../../../src/parser/TrackLoggingCurrentNodeVisitor";
import {Symbols} from "../../../src/parser/symbols/symbols";
import {LexyScriptNode} from "../../../src/language/lexyScriptNode";
import {Libraries} from "../../../src/functionLibraries/libraries";
import {TestFile} from "../../testFile";

describe('DeriveTypeTests', () => {
  it('numberLiteral', async () => {
    const type = deriveType(`5`);
    expect(type).toBe(ValueType.number);
  });

  it('stringLiteral', async () => {
    const type = deriveType(`"abc"`);
    expect(type).toBe(ValueType.string);
  });

  it('booleanLiteralToken', async () => {
    const type = deriveType(`true`);
    expect(type).toBe(ValueType.boolean);
  });

  it('booleanLiteralFalse', async () => {
    const type = deriveType(`false`);
    expect(type).toBe(ValueType.boolean);
  });

  it('dateTimeLiteralToken', async () => {
    const type = deriveType(`d"2024-12-24T10:05:00"`);
    expect(type).toBe(ValueType.date);
  });

  it('numberCalculationLiteral', async () => {
    const type = deriveType(`5 + 5`);
    expect(type).toBe(ValueType.number);
  });

  it('stringConcatLiteral', async () => {
    const type = deriveType(`"abc" + "def"`);
    expect(type).toBe(ValueType.string);
  });

  it('booleanLogicalLiteral', async () => {
    const type = deriveType(`true && false`);
    expect(type).toBe(ValueType.boolean);
  });

  it('stringVariable', async () => {
    const type = deriveType(`a`, context => {
      context.variableContext.registerVariableAndVerifyUnique(newReference(), `a`, ValueType.string,
        VariableSource.Results);
    });

    expect(type).toBe(ValueType.string);
  });

  it('numberVariable', async () => {
    const type = deriveType(`a`, context => {
      context.variableContext.registerVariableAndVerifyUnique(newReference(), `a`, ValueType.number,
        VariableSource.Results);
    });
    expect(type).toBe(ValueType.number);
  });

  it('booleanVariable', async () => {
    const type = deriveType(`a`, context => {
      context.variableContext.registerVariableAndVerifyUnique(newReference(), `a`, ValueType.boolean,
        VariableSource.Results);
    });
    expect(type).toBe(ValueType.boolean);
  });

  it('dateTimeVariable', async () => {
    const type = deriveType(`a`, context => {
      context.variableContext.registerVariableAndVerifyUnique(newReference(), `a`, ValueType.date,
        VariableSource.Results);
    });
    expect(type).toBe(ValueType.date);
  });

  it('stringVariableConcat', async () => {
    const type = deriveType(`a + "bc"`, context => {
      context.variableContext.registerVariableAndVerifyUnique(newReference(), `a`, ValueType.string,
        VariableSource.Results);
    });
    expect(type).toBe(ValueType.string);
  });

  it('numberVariableCalculation', async () => {
    const type = deriveType(`a + 20`, context => {
      context.variableContext.registerVariableAndVerifyUnique(newReference(), `a`, ValueType.number,
        VariableSource.Results);
    });
    expect(type).toBe(ValueType.number);
  });

  it('numberVariableWithParenthesisCalculation', async () => {
    const type = deriveType(`(a + 20.05) * 3`, context => {
      context.variableContext.registerVariableAndVerifyUnique(newReference(), `a`, ValueType.number,
        VariableSource.Results);
    });
    expect(type).toBe(ValueType.number);
  });

  function newReference() {
    return new SourceReference(TestFile.instance, 1, 1, 1);
  }

  function deriveType(expressionValue: string,
                      validationContextHandler: ((context: IValidationContext) => void) | null = null): Type | null {

    const componentNodes = new ComponentNodeList();
    const logger = new ParserLogger(LoggingConfiguration.getParserLogger());
    const lexyScriptNode = new LexyScriptNode(TestFile.instance.project);
    const symbols = new Symbols(lexyScriptNode);
    const visitor = new TrackLoggingCurrentNodeVisitor(logger);
    const validationContext = new ValidationContext(logger, componentNodes, visitor, new Libraries([]), symbols);

    let returnValue: Type | null = null;
    validationContext.inNodeVariableScope(lexyScriptNode, () => {
      if (validationContextHandler) validationContextHandler(validationContext);
      let expression = parseExpression(expressionValue);
      returnValue = expression.deriveType(validationContext);
    });
    return returnValue;
  }
});
