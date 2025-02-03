import {FunctionCall} from "./functionCall";
import {LookupFunction} from "../../../language/expressions/functions/lookupFunction";
import {CodeWriter} from "../writers/codeWriter";
import {tableClassName} from "../classNames";
import {LexyCodeConstants} from "../lexyCodeConstants";
import {LookupByFunction} from "../../../language/expressions/functions/lookupByFunction";

export class LookUpByFunctionCall extends FunctionCall<LookupByFunction> {
  public override renderExpression(expression: LookupByFunction, codeWriter: CodeWriter) {
    codeWriter.writeEnvironment(".builtInTableFunctions.lookUpBy(");
    codeWriter.write(`"${expression.resultColumn.member}", `);
    codeWriter.write(`"${expression.discriminatorValueColumn.member}", `);
    codeWriter.write(`"${expression.searchValueColumn.member}", `);
    codeWriter.write(`"${expression.table}", `);
    codeWriter.writeEnvironment(`.${tableClassName(expression.table)}.__values, `);
    codeWriter.renderExpression(expression.discriminatorExpression);
    codeWriter.write(`, `);
    codeWriter.renderExpression(expression.valueExpression);
    codeWriter.write(`, ${LexyCodeConstants.contextVariable})`);
  }
}