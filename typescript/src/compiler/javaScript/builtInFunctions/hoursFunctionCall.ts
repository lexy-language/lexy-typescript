import {EndStartDateFunctionCall} from "./endStartDateFunctionCall";
import {HoursFunction} from "../../../language/expressions/functions/hoursFunction";

export class HoursFunctionCall extends EndStartDateFunctionCall<HoursFunction> {
   protected override className = "builtInDateFunctions";
   protected override methodName = "hours";
}
