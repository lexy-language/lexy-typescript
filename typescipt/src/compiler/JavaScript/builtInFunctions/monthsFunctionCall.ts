import {EndStartDateFunctionCall} from "./endStartDateFunctionCall";
import {MonthsFunction} from "../../../language/expressions/functions/monthsFunction";

export class MonthsFunctionCall extends EndStartDateFunctionCall<MonthsFunction> {
   protected override className = "BuiltInDateFunctions";
   protected override methodName = "months";
}
