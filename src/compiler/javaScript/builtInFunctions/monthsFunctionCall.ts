import {EndStartDateFunctionCall} from "./endStartDateFunctionCall";
import {MonthsFunction} from "../../../language/expressions/functions/monthsFunction";

export class MonthsFunctionCall extends EndStartDateFunctionCall<MonthsFunction> {
   protected override className = "builtInDateFunctions";
   protected override methodName = "months";
}
