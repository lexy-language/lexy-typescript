import {tokenize} from "./tokenize";
import {OperatorType} from "../../src/parser/tokens/operatorType";

describe('FunctionCallTests', () => {
  it('TestIntTypeLiteral', async () => {
    tokenize("   SimpleTable.LookUp(Value, \"Result\")")
      .count(6)
      .memberAccess(0, "SimpleTable.LookUp")
      .operator(1, OperatorType.OpenParentheses)
      .stringLiteral(2, "Value")
      .operator(3, OperatorType.ArgumentSeparator)
      .quotedString(4, "Result")
      .operator(5, OperatorType.CloseParentheses)
      .assert();
  });
});