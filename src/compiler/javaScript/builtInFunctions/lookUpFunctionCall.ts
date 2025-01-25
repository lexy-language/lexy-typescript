import {FunctionCall} from "./functionCall";
import {LookupFunction} from "../../../language/expressions/functions/lookupFunction";
import {CodeWriter} from "../writers/codeWriter";
import {renderExpression} from "../renderers/renderExpression";
import {tableClassName} from "../classNames";
import {LexyCodeConstants} from "../lexyCodeConstants";

export class LookUpFunctionCall extends FunctionCall<LookupFunction> {
  public override renderExpression(expression: LookupFunction, codeWriter: CodeWriter) {
    codeWriter.writeEnvironment(".builtInTableFunctions.lookUp(");
    codeWriter.write(`"${expression.resultColumn.member}", `);
    codeWriter.write(`"${expression.searchValueColumn.member}", `);
    codeWriter.write(`"${expression.table}", `);
    codeWriter.writeEnvironment(`.${tableClassName(expression.table)}.__values, ` );
    renderExpression(expression.valueExpression, codeWriter);
    codeWriter.write(`, ${LexyCodeConstants.contextVariable})`);
  }
}
