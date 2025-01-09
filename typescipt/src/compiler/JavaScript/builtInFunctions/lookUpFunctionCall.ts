import {FunctionCall} from "./functionCall";
import {LookupFunction} from "../../../language/expressions/functions/lookupFunction";
import {CodeWriter} from "../writers/codeWriter";
import {LexyCodeConstants} from "../../lexyCodeConstants";
import {renderExpression} from "../renderers/renderExpression";

export class LookUpFunctionCall extends FunctionCall<LookupFunction> {

  override renderCustomFunction(expresion: LookupFunction, codeWriter: CodeWriter) {
    /* return MethodDeclaration(
      Types.Syntax(LookupFunction.resultColumnType),
      Identifier(methodName))
      .WithModifiers(Modifiers.PrivateStatic())
      .WithParameterList(
        ParameterList(
          SeparatedArray<ParameterSyntax>(
            new SyntaxNodeOrToken[]
    {
      Parameter(Identifier(`condition`))
        .WithType(Types.Syntax(LookupFunction.SearchValueColumnType)),
        Token(SyntaxKind.CommaToken),
        Parameter(Identifier(LexyCodeConstants.ContextVariable))
          .WithType(IdentifierName(`IExecutionContext`))
    }
  )))
  .
    WithBody(
      Block(
        SingletonArray<StatementSyntax>(
          ReturnStatement(
            InvocationExpression(
              MemberAccessExpression(
                SyntaxKind.SimpleMemberAccessExpression,
                IdentifierName(nameof(BuiltInTableFunctions)),
                IdentifierName(nameof(BuiltInTableFunctions.LookUp))))
              .WithArgumentList(
                ArgumentList(
                  SeparatedArray<ArgumentSyntax>(
                    new SyntaxNodeOrToken[]
    {
      Arguments.String(LookupFunction.resultColumn.Member),
        Token(SyntaxKind.CommaToken),
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
        Arguments.MemberAccessLambda(`row`,
          LookupFunction.resultColumn.Member),
        Token(SyntaxKind.CommaToken),
        Argument(IdentifierName(LexyCodeConstants.ContextVariable))
    }
  )))))))
    ;*/
  }

  public override renderExpression(expression: LookupFunction, codeWriter: CodeWriter) {
    codeWriter.write(`${LookUpFunctionCall.methodName(expression)}(`)
    renderExpression(expression.valueExpression, codeWriter);
    codeWriter.write(`, ${LexyCodeConstants.contextVariable})`)
  }

  private static methodName(expression: LookupFunction) {
    return `__LookUp${expression.table}${expression.resultColumn.member}By${expression.searchValueColumn.member}`;
  }
}
