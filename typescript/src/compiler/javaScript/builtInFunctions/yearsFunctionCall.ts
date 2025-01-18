import {EndStartDateFunctionCall} from "./endStartDateFunctionCall";
import {YearsFunction} from "../../../language/expressions/functions/yearsFunction";

export class YearsFunctionCall extends EndStartDateFunctionCall<YearsFunction> {
   protected override className = "builtInDateFunctions";
   protected override methodName = "years";
}
