import {FunctionCall} from "./functionCall";
import {LookupFunction} from "../../../language/expressions/functions/lookupFunction";
import {tableClassName} from "../classNames";
import {LexyCodeConstants} from "../lexyCodeConstants";
import {CodeWriter} from "../writers/codeWriter";

export class LookUpFunctionCall extends FunctionCall<LookupFunction> {
  public override renderExpression(expression: LookupFunction, codeWriter: CodeWriter) {
    codeWriter.writeEnvironment(".builtInTableFunctions.lookUp(");
    codeWriter.write(`"${expression.resultColumn.member}", `);
    codeWriter.write(`"${expression.searchValueColumn.member}", `);
    codeWriter.write(`"${expression.table}", `);
    codeWriter.writeEnvironment(`.${tableClassName(expression.table)}.__values, ` );
    codeWriter.renderExpression(expression.valueExpression);
    codeWriter.write(`, ${LexyCodeConstants.contextVariable})`);
  }
}