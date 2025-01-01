import {tokenize} from "./tokenize";

describe('DateTimeLiteralsTests', () => {
  it('TestQuotedLiteral', async () => {
    tokenize("   OutDateTime = d\"2024-12-16T13:26:55\"")
      .count(3)
      .dateTime(2, 2024, 12, 16, 13, 26, 55)
      .assert();
  });
});