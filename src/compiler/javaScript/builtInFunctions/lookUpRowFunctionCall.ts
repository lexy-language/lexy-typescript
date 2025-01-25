import {FunctionCall} from "./functionCall";
import {LookupRowFunction} from "../../../language/expressions/functions/lookupRowFunction";
import {CodeWriter} from "../writers/codeWriter";
import {LexyCodeConstants} from "../lexyCodeConstants";
import {renderExpression} from "../renderers/renderExpression";
import {tableClassName} from "../classNames";

export class LookUpRowFunctionCall extends FunctionCall<LookupRowFunction> {
   public override renderExpression(expression: LookupRowFunction, codeWriter: CodeWriter) {
     codeWriter.writeEnvironment();
     codeWriter.write(".builtInTableFunctions.lookUpRow(");
     codeWriter.write(`"${expression.searchValueColumn.member}", `);
     codeWriter.write(`"${expression.table}", `);
     codeWriter.writeEnvironment(`.${tableClassName(expression.table)}.__values, ` );
     renderExpression(expression.valueExpression, codeWriter);
     codeWriter.write(`, ${LexyCodeConstants.contextVariable})`);
  }
}
