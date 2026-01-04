import {tokenize} from "./tokenize";
import {MemberAccessLiteralToken} from "../../src/parser/tokens/memberAccessLiteralToken";
import {TokenType} from "../../src/parser/tokens/tokenType";

describe('MemberAccessTests', () => {
  it('TestTableHeader', async () => {
    tokenize("    Source.Member")
      .count(1)
      .type<MemberAccessLiteralToken>(0, TokenType.MemberAccessLiteralToken)
      .memberAccess(0, "Source.Member")
      .assert();
  });
});