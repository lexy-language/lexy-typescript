import {FunctionCall} from "./functionCall";
import {LookupRowFunction} from "../../../language/expressions/functions/lookupRowFunction";
import {LexyCodeConstants} from "../lexyCodeConstants";
import {tableClassName} from "../classNames";
import {CodeWriter} from "../writers/codeWriter";

export class LookUpRowFunctionCall extends FunctionCall<LookupRowFunction> {
   public override renderExpression(expression: LookupRowFunction, codeWriter: CodeWriter) {
     codeWriter.writeEnvironment();
     codeWriter.write(".builtInTableFunctions.lookUpRow(");
     codeWriter.write(`"${expression.searchValueColumn.member}", `);
     codeWriter.write(`"${expression.tableName}", `);
     codeWriter.writeEnvironment(`.${tableClassName(expression.tableName)}.__values, ` );
     codeWriter.renderExpression(expression.valueExpression);
     codeWriter.write(`, ${LexyCodeConstants.contextVariable})`);
  }
}