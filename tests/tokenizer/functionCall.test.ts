import {tokenize} from "./tokenize";
import {OperatorType} from "../../src/parser/tokens/operatorType";

describe('FunctionCallTests', () => {
  it('TestWithMemberAccessArgument', async () => {
    tokenize("   SimpleTable.LookUp(5, \"Result\")")
      .count(6)
      .memberAccess(0, "SimpleTable.LookUp")
      .operator(1, OperatorType.OpenParentheses)
      .numberLiteral(2, 5)
      .operator(3, OperatorType.ArgumentSeparator)
      .quotedString(4, "Result")
      .operator(5, OperatorType.CloseParentheses)
      .assert();
  });

  it('TestWithParametersSpreadOperator', async () => {
    tokenize("   lookUp(...)")
      .count(4)
      .stringLiteral(0, "lookUp")
      .operator(1, OperatorType.OpenParentheses)
      .operator(2, OperatorType.Spread)
      .operator(3, OperatorType.CloseParentheses)
      .assert();
  });

  it('TestWithParametersSpreadOperator', async () => {
    tokenize("   ... = lookUp()")
      .count(5)
      .operator(0, OperatorType.Spread)
      .operator(1, OperatorType.Assignment)
      .stringLiteral(2, "lookUp")
      .operator(3, OperatorType.OpenParentheses)
      .operator(4, OperatorType.CloseParentheses)
      .assert();
  });

  it('TestWithParametersAndResultsSpreadOperator', async () => {
    tokenize("   ... = lookUp(...)")
      .count(6)
      .operator(0, OperatorType.Spread)
      .operator(1, OperatorType.Assignment)
      .stringLiteral(2, "lookUp")
      .operator(3, OperatorType.OpenParentheses)
      .operator(4, OperatorType.Spread)
      .operator(5, OperatorType.CloseParentheses)
      .assert();
  });
});