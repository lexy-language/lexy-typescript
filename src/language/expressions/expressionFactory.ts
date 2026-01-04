import {TokenList} from "../../parser/tokens/tokenList";
import {ExpressionSource} from "./expressionSource";
import {newParseExpressionFailed, ParseExpressionResult} from "./parseExpressionResult";
import {Line} from "../../parser/line";
import {IfExpression} from "./ifExpression";
import {ElseExpression} from "./elseExpression";
import {SwitchExpression} from "./switchExpression";
import {CaseExpression} from "./caseExpression";
import {VariableDeclarationExpression} from "./variableDeclarationExpression";
import {AssignmentExpression} from "./assignmentExpression";
import {ParenthesizedExpression} from "./parenthesizedExpression";
import {BracketedExpression} from "./bracketedExpression";
import {IdentifierExpression} from "./identifierExpression";
import {MemberAccessExpression} from "./memberAccessExpression";
import {LiteralExpression} from "./literalExpression";
import {BinaryExpression} from "./binaryExpression";
import {FunctionCallExpression} from "./functions/functionCallExpression";
import {FunctionCallExpressionParser} from "./functions/functionCallExpressionParser";
import {ElseifExpression} from "./elseifExpression";

export interface IExpressionFactory {
  parse(tokens: TokenList, currentLine: Line): ParseExpressionResult;
}

export class ExpressionFactory implements IExpressionFactory {

   private static factories: {
      criteria: (tokens: TokenList) => boolean,
      parse: ((source: ExpressionSource, factory: IExpressionFactory) => ParseExpressionResult) }[] = [
         { criteria: IfExpression.isValid, parse: IfExpression.parse },
         { criteria: ElseExpression.isValid, parse: ElseExpression.parse },
         { criteria: ElseifExpression.isValid, parse: ElseifExpression.parse },
         { criteria: SwitchExpression.isValid, parse: SwitchExpression.parse },
         { criteria: CaseExpression.isValid, parse: CaseExpression.parse },
         { criteria: VariableDeclarationExpression.isValid, parse: VariableDeclarationExpression.parse },
         { criteria: AssignmentExpression.isValid, parse: AssignmentExpression.parse },
         { criteria: ParenthesizedExpression.isValid, parse: ParenthesizedExpression.parse },
         { criteria: BracketedExpression.isValid, parse: BracketedExpression.parse },
         { criteria: IdentifierExpression.isValid, parse: IdentifierExpression.parse },
         { criteria: MemberAccessExpression.isValid, parse: MemberAccessExpression.parse },
         { criteria: LiteralExpression.isValid, parse: LiteralExpression.parse },
         { criteria: BinaryExpression.isValid, parse: BinaryExpression.parse },
         { criteria: FunctionCallExpression.isValid, parse: FunctionCallExpressionParser.parse }
       ];

   public parse(tokens: TokenList, currentLine: Line): ParseExpressionResult {
     let source = new ExpressionSource(currentLine, tokens);
     for (let index = 0 ; index < ExpressionFactory.factories.length ; index++) {
       const factory = ExpressionFactory.factories[index];
       if (factory.criteria(tokens)) {
         return factory.parse(source, this);
       }
     }

     return newParseExpressionFailed("ExpressionFactory", `Invalid expression: ${tokens}`);
   }
}
