import {TokenList} from "../../parser/tokens/tokenList";
import {
  ArgumentTokenParseResult,
  newArgumentTokenParseFailed,
  newArgumentTokenParseSuccess
} from "./argumentTokenParseResult";
import {Token} from "../../parser/tokens/token";
import {OperatorToken} from "../../parser/tokens/operatorToken";
import {OperatorType} from "../../parser/tokens/operatorType";
import {TokenType} from "../../parser/tokens/tokenType";

class ParseContext {
  public result: Array<TokenList> = new Array<TokenList>();
  public argumentTokens: Array<Token> = new Array<Token>();

  public countParentheses: number = 0;
  public countBrackets: number = 0;
}

export class ArgumentList {

 public static parse(tokens: TokenList): ArgumentTokenParseResult {
   if (tokens.length == 0) return newArgumentTokenParseSuccess(new Array<TokenList>());

   let context = new ParseContext();
   for (let index = 0 ; index < tokens.length; index ++) {
     const token = tokens.get(index);

     let result = this.processToken(context, token);
     if (result != null) return result;
   }

   if (context.argumentTokens.length == 0){
     return newArgumentTokenParseFailed(`Invalid token ','. No tokens before comma.`);
   }

   context.result.push(new TokenList(context.argumentTokens));

   return newArgumentTokenParseSuccess(context.result);
 }

   private static processToken(context: ParseContext, token: Token): ArgumentTokenParseResult | null {
     if (token.tokenType != TokenType.OperatorToken) {
       context.argumentTokens.push(token);
       return null;
     }

     const operatorToken = token as OperatorToken;
     this.countScopeCharacters(context, operatorToken);

     if (context.countParentheses == 0
      && context.countBrackets == 0
      && operatorToken.type == OperatorType.ArgumentSeparator) {

       if (context.argumentTokens.length == 0) {
         return newArgumentTokenParseFailed(`Invalid token ','. No tokens before comma.`);
       }

       context.result.push(new TokenList(context.argumentTokens));
       context.argumentTokens = new Array<Token>();
     } else {
       context.argumentTokens.push(token);
     }
     return null;
   }

  private static countScopeCharacters(context: ParseContext, token: OperatorToken) {
    switch (token.type) {
      case OperatorType.OpenParentheses:
        context.countParentheses++;
        break;
      case OperatorType.CloseParentheses:
        context.countParentheses--;
        break;
      case OperatorType.OpenBrackets:
        context.countBrackets++;
        break;
      case OperatorType.CloseBrackets:
        context.countBrackets--;
        break;
    }
  }
}
