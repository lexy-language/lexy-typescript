import {tokenize} from "./tokenize";
import {OperatorType} from "../../src/parser/tokens/operatorType";

describe('FunctionCallTests', () => {
  it('TestIntTypeLiteral', async () => {
    tokenize("   lookUp(SimpleTable, Value, \"Result\")")
      .count(8)
      .stringLiteral(0, "lookUp")
      .operator(1, OperatorType.OpenParentheses)
      .stringLiteral(2, "SimpleTable")
      .operator(3, OperatorType.ArgumentSeparator)
      .stringLiteral(4, "Value")
      .operator(5, OperatorType.ArgumentSeparator)
      .quotedString(6, "Result")
      .operator(7, OperatorType.CloseParentheses)
      .assert();
  });
});