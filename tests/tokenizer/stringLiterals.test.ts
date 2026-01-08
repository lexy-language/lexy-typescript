import {tokenize, tokenizeExpectError} from "./tokenize";

describe('StringLiteralsTests', () => {
  it('TestQuotedLiteral', async () => {
    tokenize("   \"This is a quoted literal\"")
      .count(1)
      .quotedString(0, "This is a quoted literal")
      .assert();
  });

  it('TestStringLiteral', async () => {
    tokenize("   ThisIsAStringLiteral").count(1)
      .stringLiteral(0, "ThisIsAStringLiteral")
      .assert();
  });

  it('TestOpenEndStringLiteral', async () => {
    let result = tokenizeExpectError("   \"This is a quoted literal");
    expect(result.errorMessage).toBe("Invalid token at end of line. Closing quote expected.");
  });
});