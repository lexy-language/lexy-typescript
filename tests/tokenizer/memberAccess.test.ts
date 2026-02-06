import {tokenize} from "./tokenize";
import {MemberAccessToken} from "../../src/parser/tokens/memberAccessToken";
import {TokenType} from "../../src/parser/tokens/tokenType";
import {IncompleteMemberAccessToken} from "../../src/parser/tokens/incompleteMemberAccessToken";

describe('MemberAccessTests', () => {
  it('Complete', async () => {
    tokenize("    Source.Member")
      .count(1)
      .type<MemberAccessToken>(0, TokenType.MemberAccessToken)
      .memberAccess(0, "Source.Member")
      .assert();
  });
  it('Incomplete', async () => {
    tokenize("    Source.")
      .count(1)
      .type<IncompleteMemberAccessToken>(0, TokenType.IncompleteMemberAccessToken)
      .incompleteMemberAccess(0, "Source.")
      .assert();
  });
});
