import {IfExpression} from "./ifExpression";
import {ElseExpression} from "./elseExpression";
import {SwitchExpression} from "./switchExpression";
import {CaseExpression} from "./caseExpression";
import {VariableDeclarationExpression} from "./variableDeclarationExpression";
import {SpreadAssignmentExpression} from "./spreadAssignmentExpression";
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
import {SpreadExpression} from "./spreadExpression";
import {ExpressionFactory} from "./expressionFactory";

//ExpressionFactory can't initialize it's expressions itself because it generates a circular reference.
export function initializeExpressionFactory() {
  ExpressionFactory.initialize([
    {criteria: IfExpression.isValid, parse: IfExpression.parse},
    {criteria: ElseExpression.isValid, parse: ElseExpression.parse},
    {criteria: ElseifExpression.isValid, parse: ElseifExpression.parse},
    {criteria: SwitchExpression.isValid, parse: SwitchExpression.parse},
    {criteria: CaseExpression.isValid, parse: CaseExpression.parse},
    {criteria: VariableDeclarationExpression.isValid, parse: VariableDeclarationExpression.parse},
    {criteria: SpreadExpression.isValid, parse: SpreadExpression.parse},
    {criteria: SpreadAssignmentExpression.isValid, parse: SpreadAssignmentExpression.parse},
    {criteria: AssignmentExpression.isValid, parse: AssignmentExpression.parse},
    {criteria: ParenthesizedExpression.isValid, parse: ParenthesizedExpression.parse},
    {criteria: BracketedExpression.isValid, parse: BracketedExpression.parse},
    {criteria: IdentifierExpression.isValid, parse: IdentifierExpression.parse},
    {criteria: MemberAccessExpression.isValid, parse: MemberAccessExpression.parse},
    {criteria: LiteralExpression.isValid, parse: LiteralExpression.parse},
    {criteria: BinaryExpression.isValid, parse: BinaryExpression.parse},
    {criteria: FunctionCallExpression.isValid, parse: FunctionCallExpressionParser.parse}
  ]);
}
