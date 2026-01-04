import {tableClassName} from "../classNames";
import {LexyCodeConstants} from "../lexyCodeConstants";
import {CodeWriter} from "../codeWriter";
import {Expression} from "../../../language/expressions/expression";
import {
  instanceOfMemberFunctionCallExpression,
  MemberFunctionCallExpression
} from "../../../language/expressions/functions/memberFunctionCallExpression";
import {Assert} from "../../../infrastructure/assert";
import {
  asLookUpFunctionCall,
  instanceOfLookUpFunctionCall
} from "../../../language/variableTypes/functions/lookUpFunctionCall";

export class TableLookUpFunctionCall {

  public static matches(expression: Expression) {
    return instanceOfMemberFunctionCallExpression(expression)
      && instanceOfLookUpFunctionCall(expression.functionCall);
  }

  public static render(expression: MemberFunctionCallExpression, codeWriter: CodeWriter) {
    const functionCall = Assert.notNull(asLookUpFunctionCall(expression.functionCall), "expression.functionCall as LookUpFunction")

    codeWriter.writeEnvironment();
    if (functionCall.discriminatorColumn && functionCall.discriminatorExpression) {
      codeWriter.write(".tableLibrary.lookUpBy(");
      codeWriter.write(`"${functionCall.discriminatorColumn}", `);
      codeWriter.renderExpression(functionCall.discriminatorExpression);
      codeWriter.write(", ");
    } else {
      codeWriter.write(".tableLibrary.lookUp(");
    }

    codeWriter.write(`"${functionCall.searchValueColumn}", `);
    codeWriter.renderExpression(functionCall.valueExpression);

    codeWriter.write(`, "${functionCall.tableName}", `);
    codeWriter.writeEnvironment(`.${tableClassName(functionCall.tableName)}.__values, ` );

    codeWriter.write(`"${functionCall.resultColumn}", `);
    codeWriter.write(`${LexyCodeConstants.contextVariable})`);
  }
}