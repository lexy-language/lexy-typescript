import {FunctionCall} from "./functionCall";
import {LookupRowFunction} from "../../../language/expressions/functions/lookupRowFunction";
import {CodeWriter} from "../writers/codeWriter";
import {LexyCodeConstants} from "../../lexyCodeConstants";
import {renderExpression} from "../renderers/renderExpression";

export class LookUpRowFunctionCall extends FunctionCall<LookupRowFunction> {
   override renderCustomFunction(expression: LookupRowFunction, codeWriter: CodeWriter) {
/*     return MethodDeclaration(
         Types.Syntax(LookupFunction.RowType),
         Identifier(methodName))
       .WithModifiers(Modifiers.PrivateStatic())
       .WithParameterList(
         ParameterList(
           SeparatedArray<ParameterSyntax>(
             new SyntaxNodeOrToken[] {
               Parameter(Identifier(`condition`))
                 .WithType(Types.Syntax(LookupFunction.SearchValueColumnType)),
               Token(SyntaxKind.CommaToken),
               Parameter(Identifier(LexyCodeConstants.ContextVariable))
                 .WithType(IdentifierName(`IExecutionContext`))
             })))
       .WithBody(
         Block(
           SingletonArray<StatementSyntax>(
             ReturnStatement(
               InvocationExpression(
                   MemberAccessExpression(
                     SyntaxKind.SimpleMemberAccessExpression,
                     IdentifierName(nameof(BuiltInTableFunctions)),
                     IdentifierName(nameof(BuiltInTableFunctions.LookUpRow))))
                 .WithArgumentList(
                   ArgumentList(
                     SeparatedArray<ArgumentSyntax>(
                       new SyntaxNodeOrToken[] {
                         Arguments.String(LookupFunction.searchValueColumn.Member),
                         Token(SyntaxKind.CommaToken),
                         Arguments.String(LookupFunction.Table),
                         Token(SyntaxKind.CommaToken),
                         Arguments.MemberAccess(ClassNames.TableClassName(LookupFunction.Table),
                           `Values`),
                         Token(SyntaxKind.CommaToken),
                         Argument(IdentifierName(`condition`)),
                         Token(SyntaxKind.CommaToken),
                         Arguments.MemberAccessLambda(`row`,
                           LookupFunction.searchValueColumn.Member),
                         Token(SyntaxKind.CommaToken),
                         Argument(IdentifierName(LexyCodeConstants.ContextVariable))
                       })))))));
 */
   }

  public override renderExpression(expression: LookupRowFunction, codeWriter: CodeWriter) {
    codeWriter.write(`${this.methodName}(`)
    renderExpression(expression.valueExpression, codeWriter);
    codeWriter.write(`, ${LexyCodeConstants.contextVariable})`)
  }

  private methodName(expression: LookupRowFunction) {
    return `__LookUp${expression.table}RowBy${expression.searchValueColumn.member}`;
  }
}
