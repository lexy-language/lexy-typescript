import {LexyCodeConstants} from "../lexyCodeConstants";
import {tableClassName} from "../classNames";
import {CodeWriter} from "../codeWriter";
import {Expression} from "../../../language/expressions/expression";
import {
  instanceOfMemberFunctionCallExpression,
  MemberFunctionCallExpression
} from "../../../language/expressions/functions/memberFunctionCallExpression";
import {Assert} from "../../../infrastructure/assert";
import {
  asLookUpRowFunctionCall,
  instanceOfLookUpRowFunctionCall
} from "../../../language/variableTypes/functions/lookUpRowFunctionCall";

export class TableLookUpRowFunctionCallRenderer {

  public static matches(expression: Expression) {
    return instanceOfMemberFunctionCallExpression(expression)
        && instanceOfLookUpRowFunctionCall(expression.functionCall);
  }

  public static render(expression: MemberFunctionCallExpression, codeWriter: CodeWriter) {
    const functionCall = Assert.notNull(asLookUpRowFunctionCall(expression.functionCall), "expression.functionCall as LookUpRowFunction")

    codeWriter.writeEnvironment();
    if (functionCall.discriminatorColumn && functionCall.discriminatorExpression) {
      codeWriter.write(".tableLibrary.lookUpRowBy(");
      codeWriter.write(`"${functionCall.discriminatorColumn}", `);
      codeWriter.renderExpression(functionCall.discriminatorExpression);
      codeWriter.write(", ");
    } else {
      codeWriter.write(".tableLibrary.lookUpRow(");
    }

    codeWriter.write(`"${functionCall.searchValueColumn}", `);
    codeWriter.renderExpression(functionCall.valueExpression);

    codeWriter.write(`, "${functionCall.tableName}", `);
    codeWriter.writeEnvironment(`.${tableClassName(functionCall.tableName)}.__values, ` );

    codeWriter.write(`${LexyCodeConstants.contextVariable})`);
  }
}