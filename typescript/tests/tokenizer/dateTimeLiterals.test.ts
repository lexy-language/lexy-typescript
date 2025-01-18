import {tokenize} from "./tokenize";

describe('DateTimeLiteralsTests', () => {
  it('TestWithT', async () => {
    tokenize("   OutDateTime = d\"2024-12-16T13:26:55\"")
      .count(3)
      .dateTime(2, 2024, 12, 16, 13, 26, 55)
      .assert();
  });

  it('TestWithSpace', async () => {
    tokenize("   OutDateTime = d\"2024-12-16 13:26:55\"")
      .count(3)
      .dateTime(2, 2024, 12, 16, 13, 26, 55)
      .assert();
  });

  it('TestInFuture', async () => {
    tokenize("   OutDateTime = d\"2222-03-28 12:01:12\"")
      .count(3)
      .dateTime(2, 2222, 3, 28, 12, 1, 12)
      .assert();
  });
});