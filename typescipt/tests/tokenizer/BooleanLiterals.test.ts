import {tokenize} from "./tokenize";

describe('Boolean Literals Tests', () => {
  it('TestBooleanTrueLiteral', async () => {
    tokenize("   true")
      .count(1)
      .boolean(0, true)
      .assert();
  });
  it('TestBooleanFalseLiteral', async () => {
    tokenize("   false")
      .count(1)
      .boolean(0, false)
      .assert();
  });
});