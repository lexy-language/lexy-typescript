import {FunctionCall} from "./functionCall";
import {LookupRowByFunction} from "../../../language/expressions/functions/lookupRowByFunction";
import {CodeWriter} from "../writers/codeWriter";
import {tableClassName} from "../classNames";
import {LexyCodeConstants} from "../lexyCodeConstants";

export class LookUpRowByFunctionCall extends FunctionCall<LookupRowByFunction> {
  public override renderExpression(expression: LookupRowByFunction, codeWriter: CodeWriter) {
    codeWriter.writeEnvironment();
    codeWriter.write(".builtInTableFunctions.lookUpRowBy(");
    codeWriter.write(`"${expression.discriminatorValueColumn.member}", `);
    codeWriter.write(`"${expression.searchValueColumn.member}", `);
    codeWriter.write(`"${expression.tableName}", `);
    codeWriter.writeEnvironment(`.${tableClassName(expression.tableName)}.__values, `);
    codeWriter.renderExpression(expression.discriminatorExpression);
    codeWriter.write(`, `);
    codeWriter.renderExpression(expression.valueExpression);
    codeWriter.write(`, ${LexyCodeConstants.contextVariable})`);
  }
}